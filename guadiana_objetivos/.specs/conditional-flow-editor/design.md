# Diseño Técnico: Editor Visual de Flujo Condicional

## Stack tecnológico

| Tecnología | Uso |
|-----------|-----|
| `@xyflow/react` v12 | Canvas de nodos y aristas interactivo |
| Next.js 15 App Router | Framework base |
| Supabase | Persistencia de condiciones |
| Tailwind CSS + shadcn/ui | Estilos y componentes UI |

---

## Modelo de datos

### Relaciones

```
form_surveys
  └── form_sections  ──────────────── nodos del canvas
        └── form_questions
              └── form_question_options
  └── form_conditions  ─────────────── aristas del canvas
        ├── source_question_id → form_questions (pregunta disparadora)
        ├── source_option_id   → form_question_options (opción que activa)
        └── target_section_id  → form_sections (sección destino)
```

### Nueva tabla: `form_conditions`

```sql
CREATE TABLE form_conditions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id           UUID NOT NULL REFERENCES form_surveys(id) ON DELETE CASCADE,
  source_question_id  UUID NOT NULL REFERENCES form_questions(id) ON DELETE CASCADE,
  source_option_id    UUID REFERENCES form_question_options(id) ON DELETE SET NULL,
  condition_value     TEXT NOT NULL,   -- 'true'/'false' para boolean, option.value para single_choice
  target_section_id   UUID REFERENCES form_sections(id) ON DELETE CASCADE,
  action              TEXT NOT NULL DEFAULT 'jump_to_section',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_form_conditions_survey   ON form_conditions(survey_id);
CREATE INDEX idx_form_conditions_question ON form_conditions(source_question_id);
```

### RLS

```sql
ALTER TABLE form_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conditions_all" ON form_conditions USING (true) WITH CHECK (true);
```

---

## Estructura de archivos

```
web/src/
  components/editor/
    flow/
      flow-editor.tsx          ← canvas principal (ReactFlow + lógica de nodos/aristas)
      section-node.tsx         ← componente de nodo personalizado para secciones
      condition-edge.tsx       ← arista personalizada con etiqueta de condición
      edge-config-panel.tsx    ← panel lateral para configurar/eliminar una condición
  app/(dashboard)/formularios/[id]/editar/
    page.tsx                   ← MODIFICAR: cargar conditions junto a secciones
    editor-client.tsx          ← MODIFICAR: agregar tabs + prop conditions
    section-actions.ts         ← MODIFICAR: agregar createCondition/updateCondition/deleteCondition
```

---

## Interfaces TypeScript

```typescript
// Condición almacenada en BD
interface Condition {
  id: string
  survey_id: string
  source_question_id: string
  source_option_id: string | null
  condition_value: string
  target_section_id: string
  action: 'jump_to_section'
  created_at: string
}

// Data de un nodo de sección en React Flow
type SectionNodeData = {
  section: Section
  questionCount: number
}

// Data de una arista de condición en React Flow
type ConditionEdgeData = {
  condition: Condition
  questionLabel: string
  optionLabel: string
  isInvalid?: boolean
}
```

---

## Componentes

### `section-node.tsx`

Nodo rectangular que representa una sección. Tiene:
- **Handle de entrada** (izquierda, `type="target"`)
- **Handle de salida** (derecha, `type="source"`)
- Muestra: número, título, badge con cantidad de preguntas
- Estilos: borde `#004B8D`, fondo blanco

```tsx
export function SectionNode({ data }: NodeProps<SectionNodeData>) {
  return (
    <div className="rounded-lg border-2 border-[#004B8D] bg-white px-4 py-3 shadow-sm min-w-[180px]">
      <Handle type="target" position={Position.Left} />
      <div className="text-xs text-muted-foreground">Sección {data.section.order}</div>
      <div className="font-semibold text-sm">{data.section.title}</div>
      <Badge variant="outline" className="text-xs mt-1">{data.questionCount} preguntas</Badge>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
```

### `condition-edge.tsx`

Arista personalizada con etiqueta. Muestra `"[Pregunta]: [Opción]"`. Si es inválida, aparece en rojo. Al hacer clic, activa el panel de configuración.

### `edge-config-panel.tsx`

Panel deslizante (Sheet) que aparece al seleccionar una arista. Contiene:
- Select de pregunta disparadora (filtrado a `boolean` y `single_choice` de la sección origen)
- Select de opción de respuesta (cargado según la pregunta seleccionada)
- Botón "Guardar condición" → llama `createCondition` o `updateCondition`
- Botón "Eliminar condición" → llama `deleteCondition`

### `flow-editor.tsx`

Canvas principal. Convierte secciones y condiciones a nodos y aristas de React Flow:

```typescript
// Secciones → nodos
const nodes: Node[] = [
  { id: 'start', type: 'startNode', position: { x: 50, y: centerY }, data: {} },
  ...sections.map((s, i) => ({
    id: s.id,
    type: 'sectionNode',
    position: { x: 300 + i * 250, y: centerY },
    data: { section: s, questionCount: questions.filter(q => q.section_id === s.id).length }
  })),
  { id: 'end', type: 'endNode', position: { x: 300 + sections.length * 250, y: centerY }, data: {} }
]

// Condiciones → aristas
const edges: Edge[] = conditions.map(c => {
  const sourceSection = sections.find(s =>
    questions.some(q => q.id === c.source_question_id && q.section_id === s.id)
  )
  return {
    id: c.id,
    source: sourceSection?.id ?? '',
    target: c.target_section_id,
    type: 'conditionEdge',
    data: {
      condition: c,
      questionLabel: questions.find(q => q.id === c.source_question_id)?.label ?? '',
      optionLabel: options.find(o => o.id === c.source_option_id)?.label ?? c.condition_value,
      isInvalid: !sourceSection || !sections.find(s => s.id === c.target_section_id)
    }
  }
})
```

---

## Server Actions nuevas (`section-actions.ts`)

```typescript
export async function createCondition(
  surveyId: string,
  sourceQuestionId: string,
  sourceOptionId: string | null,
  conditionValue: string,
  targetSectionId: string
): Promise<{ error?: string }>

export async function updateCondition(
  conditionId: string,
  data: {
    sourceQuestionId: string
    sourceOptionId: string | null
    conditionValue: string
    targetSectionId: string
  }
): Promise<{ error?: string }>

export async function deleteCondition(conditionId: string): Promise<{ error?: string }>
```

---

## Modificación en `page.tsx` (carga server-side)

```typescript
// Agregar a la consulta existente
const { data: conditions } = await supabase
  .from('form_conditions')
  .select('*')
  .eq('survey_id', id)

// Pasar a EditorClient
<EditorClient
  survey={survey}
  sections={sections}
  questions={questions}
  options={options}
  conditions={conditions ?? []}   // ← nuevo
/>
```

---

## Modificación en `editor-client.tsx`

```tsx
// Importar Tabs de shadcn/ui (ya disponible en el proyecto)
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FlowEditor } from '@/components/editor/flow/flow-editor'

// Estado de tab
const [activeTab, setActiveTab] = useState<'estructura' | 'flujo'>('estructura')

// Layout
<Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
  <TabsList className="mx-4 mt-2">
    <TabsTrigger value="estructura">Estructura</TabsTrigger>
    <TabsTrigger value="flujo">Flujo</TabsTrigger>
  </TabsList>

  <TabsContent value="estructura" className="flex flex-1 overflow-hidden mt-0">
    {/* contenido actual: SectionsPanel + PropertiesPanel */}
  </TabsContent>

  <TabsContent value="flujo" className="flex-1 overflow-hidden mt-0">
    <FlowEditor
      sections={sections}
      questions={questions}
      options={options}
      conditions={conditions}
      surveyId={survey.id}
    />
  </TabsContent>
</Tabs>
```

---

## Lógica de ejecución condicional (`preview-client.tsx`)

Al avanzar de sección:

```typescript
function getNextSectionId(
  currentSectionId: string,
  answers: Record<string, unknown>,
  sections: Section[],
  questions: Question[],
  conditions: Condition[]
): string | null {
  // 1. Buscar condiciones cuya pregunta pertenece a la sección actual
  const currentSectionQuestionIds = questions
    .filter(q => q.section_id === currentSectionId)
    .map(q => q.id)

  const applicableConditions = conditions.filter(c =>
    currentSectionQuestionIds.includes(c.source_question_id)
  )

  // 2. Evaluar si alguna condición se cumple
  for (const condition of applicableConditions) {
    const answer = answers[condition.source_question_id]
    if (String(answer) === condition.condition_value) {
      return condition.target_section_id
    }
  }

  // 3. Sin condición que aplique → siguiente sección en orden
  const currentOrder = sections.find(s => s.id === currentSectionId)?.order ?? 0
  const nextSection = sections
    .filter(s => s.order > currentOrder)
    .sort((a, b) => a.order - b.order)[0]

  return nextSection?.id ?? null
}
```

---

## Diagrama de flujo del editor visual

```
Usuario abre tab "Flujo"
         │
         ▼
FlowEditor carga nodos (secciones) y aristas (conditions)
         │
         ▼
Usuario arrastra handle de sección A → suelta en sección B
         │
         ▼
onConnect() dispara → EdgeConfigPanel se abre
         │
         ▼
Usuario selecciona: pregunta "¿X?" + opción "Sí"
         │
         ▼
createCondition(surveyId, questionId, optionId, 'true', targetSectionId)
         │
         ▼
Arista aparece con etiqueta "¿X?: Sí"
```
