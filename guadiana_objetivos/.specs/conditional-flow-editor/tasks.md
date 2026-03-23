# Tasks: Editor Visual de Flujo Condicional

## Contexto

Implementar lógica condicional visual en el editor de formularios. El creador define condiciones (si respuesta = X → saltar a sección Y) mediante un canvas interactivo de nodos y conexiones (tab "Flujo").

**Referencias:** `requirement.md`, `design.md`

---

## Orden de ejecución

```
T-001 → T-002 → T-003 → T-004 → T-005 → T-006 → T-007 → T-008 → T-009 → T-010 → T-011
```

---

## Tareas

### [T-001] Migración DB: crear tabla `form_conditions`

Ejecutar via Supabase MCP (`mcp__claude_ai_supGuadianaObj__execute_sql`):

```sql
CREATE TABLE IF NOT EXISTS form_conditions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id           UUID NOT NULL REFERENCES form_surveys(id) ON DELETE CASCADE,
  source_question_id  UUID NOT NULL REFERENCES form_questions(id) ON DELETE CASCADE,
  source_option_id    UUID REFERENCES form_question_options(id) ON DELETE SET NULL,
  condition_value     TEXT NOT NULL,
  target_section_id   UUID REFERENCES form_sections(id) ON DELETE CASCADE,
  action              TEXT NOT NULL DEFAULT 'jump_to_section',
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_form_conditions_survey   ON form_conditions(survey_id);
CREATE INDEX IF NOT EXISTS idx_form_conditions_question ON form_conditions(source_question_id);
ALTER TABLE form_conditions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conditions_all" ON form_conditions USING (true) WITH CHECK (true);
```

**Verificación:** Tabla visible en Supabase Studio > Table Editor.

---

### [T-002] Instalar `@xyflow/react`

```bash
cd web && npm install @xyflow/react
```

**Verificación:** `package.json` incluye `"@xyflow/react": "^12.x.x"`, sin conflictos de dependencias.

---

### [T-003] Cargar conditions en `page.tsx`

**Archivo:** `web/src/app/(dashboard)/formularios/[id]/editar/page.tsx`

Agregar consulta Supabase para `form_conditions` y pasarla como prop a `EditorClient`.

```typescript
const { data: conditions } = await supabase
  .from('form_conditions')
  .select('*')
  .eq('survey_id', id)
```

Agregar prop `conditions={conditions ?? []}` a `<EditorClient />`.

**Verificación:** Sin errores TypeScript en `page.tsx`.

---

### [T-004] Server actions CRUD de condiciones

**Archivo:** `web/src/app/(dashboard)/formularios/[id]/editar/section-actions.ts`

Agregar las tres funciones:

- `createCondition(surveyId, sourceQuestionId, sourceOptionId, conditionValue, targetSectionId)`
- `updateCondition(conditionId, { sourceQuestionId, sourceOptionId, conditionValue, targetSectionId })`
- `deleteCondition(conditionId)`

Cada función usa el cliente Supabase del servidor y llama `revalidatePath`.

**Verificación:** Funciones exportadas, compilación TypeScript sin errores.

---

### [T-005] Componente `SectionNode`

**Archivo:** `web/src/components/editor/flow/section-node.tsx`

Nodo rectangular con:
- `Handle type="target"` en posición izquierda
- `Handle type="source"` en posición derecha
- Contenido: número de orden, título, badge con cantidad de preguntas
- Colores: borde `#004B8D`, fondo blanco

**Verificación:** Componente renderiza sin errores, handles visibles.

---

### [T-006] Componente `ConditionEdge`

**Archivo:** `web/src/components/editor/flow/condition-edge.tsx`

Arista personalizada que:
- Renderiza etiqueta `"[pregunta]: [opción]"` en el centro de la curva
- Si `data.isInvalid = true`, muestra la arista y etiqueta en rojo
- Al hacer clic, emite evento para abrir `EdgeConfigPanel`

**Verificación:** Etiqueta visible sobre la arista en el canvas.

---

### [T-007] Componente `EdgeConfigPanel`

**Archivo:** `web/src/components/editor/flow/edge-config-panel.tsx`

Panel (`Sheet` de shadcn/ui) que aparece al seleccionar una arista:

1. **Select "Pregunta disparadora":** filtra preguntas de la sección origen con tipo `boolean` o `single_choice`
2. **Select "Respuesta que activa el salto":** carga opciones de la pregunta seleccionada
3. **Botón "Guardar":** llama `createCondition` o `updateCondition`
4. **Botón "Eliminar condición":** llama `deleteCondition`, cierra el panel

**Criterios de aceptación:**
- Solo muestra preguntas con opciones (boolean, single_choice)
- Al guardar, la arista actualiza su etiqueta sin recargar página
- Al eliminar, la arista desaparece del canvas

---

### [T-008] Componente `FlowEditor` (canvas principal)

**Archivo:** `web/src/components/editor/flow/flow-editor.tsx`

Componente principal que:
1. Convierte `sections` → nodos React Flow (`sectionNode` + `startNode` + `endNode`)
2. Convierte `conditions` → aristas React Flow (`conditionEdge`)
3. Maneja `onConnect`: al crear nueva conexión, abre `EdgeConfigPanel` en modo "crear"
4. Maneja `onEdgeClick`: abre `EdgeConfigPanel` en modo "editar"
5. Importa estilos CSS de React Flow: `import '@xyflow/react/dist/style.css'`
6. Registra tipos de nodos y aristas personalizados via `nodeTypes` y `edgeTypes`

**Props:**
```typescript
interface FlowEditorProps {
  sections: Section[]
  questions: Question[]
  options: QuestionOption[]
  conditions: Condition[]
  surveyId: string
}
```

**Verificación:** Canvas renderiza, nodos arrastrables, conexión entre nodos abre el panel.

---

### [T-009] Integrar tab "Flujo" en `editor-client.tsx`

**Archivo:** `web/src/app/(dashboard)/formularios/[id]/editar/editor-client.tsx`

Cambios:
1. Agregar prop `conditions: Condition[]` a la interfaz `EditorClientProps`
2. Importar `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger` de `@/components/ui/tabs`
3. Importar `FlowEditor` de `@/components/editor/flow/flow-editor`
4. Envolver el contenido actual en `<TabsContent value="estructura">`
5. Agregar `<TabsContent value="flujo">` con `<FlowEditor .../>`
6. Agregar estado `activeTab` y `<TabsList>` con los dos tabs

**Criterios de aceptación:**
- Tab "Estructura" muestra el editor actual sin cambios
- Tab "Flujo" muestra el canvas con los nodos de secciones
- La transición entre tabs es inmediata

---

### [T-010] Lógica de salto condicional en `preview-client.tsx`

**Archivo:** `web/src/app/(dashboard)/formularios/[id]/vista-previa/preview-client.tsx`

Agregar prop `conditions: Condition[]` y función `getNextSectionId()`:

```typescript
function getNextSectionId(
  currentSectionId: string,
  answers: Record<string, unknown>,
  sections: Section[],
  questions: Question[],
  conditions: Condition[]
): string | null {
  // 1. Preguntas de la sección actual
  const sectionQuestionIds = questions
    .filter(q => q.section_id === currentSectionId)
    .map(q => q.id)

  // 2. Evaluar condiciones
  for (const c of conditions.filter(c => sectionQuestionIds.includes(c.source_question_id))) {
    if (String(answers[c.source_question_id]) === c.condition_value) {
      return c.target_section_id
    }
  }

  // 3. Flujo lineal por defecto
  const currentOrder = sections.find(s => s.id === currentSectionId)?.order ?? 0
  return sections
    .filter(s => s.order > currentOrder)
    .sort((a, b) => a.order - b.order)[0]?.id ?? null
}
```

Integrar en el botón "Siguiente sección" de la vista previa.

**Verificación:** En vista previa, responder la condición salta a la sección correcta.

---

### [T-011] Verificación TypeScript + ESLint

```bash
cd web && npx tsc --noEmit && npx next lint
```

**Criterio de aceptación:** 0 errores de TypeScript, 0 warnings de ESLint.

---

## Checklist de verificación end-to-end

| Escenario | Resultado esperado |
|-----------|-------------------|
| Abrir editor → tab "Flujo" | Canvas visible con secciones como nodos |
| Arrastrar handle sección A → sección B | Panel de configuración se abre |
| Seleccionar pregunta + opción → Guardar | Arista aparece con etiqueta |
| Hacer clic en arista existente | Panel abre con valores precargados |
| Eliminar condición desde panel | Arista desaparece del canvas |
| Vista previa: responder la condición | Salta a la sección configurada |
| Vista previa: respuesta sin condición | Avanza a la siguiente sección en orden |
| Sección eliminada con condición activa | Arista se muestra en rojo (inválida) |
