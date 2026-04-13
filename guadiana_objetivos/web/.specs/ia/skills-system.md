# Sistema de Habilidades (Skills) — GUADIANA

> Documento vivo. Agregar nuevas habilidades en la sección **Catálogo de Skills** conforme se vayan definiendo.

---

## ¿Qué es una Habilidad?

Una **habilidad** es un bloque de texto que el administrador crea y que GUADIANA inyecta automáticamente en su contexto antes de responder. Permite que el agente conozca políticas, procesos, FAQs y reglas de comportamiento propias de la empresa sin necesidad de código.

### Tipos

| Tipo | Uso | Ejemplo |
|---|---|---|
| `knowledge` | Información que el agente debe conocer | Política de vacaciones, horarios, beneficios |
| `behavior` | Cómo debe actuar en ciertas situaciones | Tono formal en quejas, escalar a RRHH si X |
| `process` | Paso a paso de flujos específicos | Cómo solicitar un permiso, cómo subir evidencias |

### Activación

- **Sin keywords** → siempre activa (se inyecta en todo chat)
- **Con keywords** → activa cuando alguna keyword aparece en el mensaje del usuario (ej: `vacaciones`, `permiso`, `nómina`)
- Máximo **5 skills** por mensaje para no desperdiciar tokens
- Prioridad **1–100** determina cuáles se seleccionan cuando hay más de 5 candidatas

---

## Arquitectura Técnica

### Flujo de Inyección en el Chat

```
Usuario envía mensaje
       │
       ▼
sendChatMessage(sessionId, content)
       │
       ├── loadSystemPrompt('chat')       → prompt base de GUADIANA
       ├── getUserContext(userId)          → nombre, rol, departamento, entregables
       └── loadRelevantSkills(content)    → skills activas relevantes (máx 5)
                    │
                    ├── Sin keywords → siempre incluida
                    └── Con keywords → si alguna aparece en el mensaje
       │
       ▼
systemPrompt =
  [Contexto del usuario]
  + [Habilidades activas]
  + [Prompt base GUADIANA]
```

### Tabla en Base de Datos

```sql
ai_skills (
  id               UUID PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,              -- Solo para admin, no va al prompt
  skill_type       TEXT,              -- 'knowledge' | 'behavior' | 'process'
  content          TEXT NOT NULL,     -- Lo que se inyecta en el system prompt
  trigger_keywords TEXT[],            -- Vacío = siempre activa
  is_active        BOOLEAN DEFAULT true,
  priority         INTEGER DEFAULT 50, -- 1-100
  created_by       UUID,
  updated_by       UUID,
  created_at, updated_at TIMESTAMPTZ
)
```

**RLS:** Lectura con `ia.view`, escritura con `ia.configure`.

### Archivos del Sistema

| Archivo | Propósito |
|---|---|
| `src/app/(dashboard)/ia/habilidades/page.tsx` | Página con lista de habilidades |
| `src/app/(dashboard)/ia/habilidades/skills-client.tsx` | UI CRUD (Client Component) |
| `src/app/(dashboard)/ia/habilidades/skill-actions.ts` | Server Actions (crear, editar, eliminar, toggle) |
| `src/app/(dashboard)/ia/analyze-actions.ts` | Integración: `loadRelevantSkills` + `buildSkillsBlock` |
| `src/lib/ai/types.ts` | Tipos: `AISkill`, `AISkillInput`, `AISkillType` |

### Permiso Requerido

- **Ver habilidades:** `ia.view`
- **Crear/editar/eliminar:** `ia.configure` (actualmente asignado al rol Administrador)

---

## Catálogo de Skills

> Agregar aquí las habilidades que se quieren crear. Cada entrada incluye el título, tipo, keywords y el contenido que se inyectará al agente.

---

### 🔵 Skills Pendientes de Crear

*(Agregar aquí las habilidades definidas por el equipo)*

```
Ejemplo de entrada:

#### Nombre de la Skill
- **Tipo:** knowledge | behavior | process
- **Keywords:** palabra1, palabra2 (o vacío si siempre activa)
- **Prioridad:** 50
- **Contenido:**
  Texto que el agente aprenderá. Máximo ~1200 caracteres (≈ 300 tokens).
  Puede incluir listas, pasos numerados, etc.
```

---

### ✅ Skills Implementadas

*(Aquí se mueven las skills una vez creadas en la plataforma)*

---

## Buenas Prácticas al Crear Skills

1. **Ser concreto:** El agente responde mejor con información específica que con generalidades. Preferir "Los permisos se solicitan con al menos 48h de anticipación enviando un correo a rrhh@guadiana.com" que "Los permisos se solicitan con anticipación".

2. **Limitar el tamaño:** Máximo ~1200 caracteres por skill (≈ 300 tokens). Si la información es muy extensa, dividirla en múltiples skills con keywords diferentes.

3. **Keywords útiles:** Usar palabras que el empleado naturalmente usaría al preguntar (ej: para una skill de nómina, keywords: `nómina`, `pago`, `quincena`, `sueldo`).

4. **Skills siempre activas con moderación:** Solo dejar sin keywords las habilidades de comportamiento general o información muy frecuente. Si muchas skills son siempre activas, se consume más contexto.

5. **Prioridad:** Skills más críticas o frecuentes → prioridad alta (80-100). Skills específicas → prioridad media (40-60).
