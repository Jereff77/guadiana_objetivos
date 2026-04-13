# Sistema de Políticas (Rules) — GUADIANA

> Documento vivo. Agregar nuevas políticas en la sección **Catálogo de Políticas** conforme se vayan definiendo.

---

## ¿Qué es una Política?

Una **política** es una regla obligatoria que GUADIANA inyecta en su contexto antes de responder. A diferencia de las **habilidades** (conocimiento opcional), las políticas son restricciones que el agente **siempre debe respetar**.

### Tipos

| Tipo | Uso | Ejemplo |
|---|---|---|
| `privacy` | Protección de datos personales | No revelar información de otros empleados sin permiso |
| `access_control` | Control de acceso a información | No compartir datos de nómina a roles no autorizados |
| `behavior` | Cómo debe actuar en situaciones específicas | Escalar a RRHH si hay conflictos interpersonales |
| `compliance` | Cumplimiento de normativas | No proporcionar asesoría legal o médica |

### Severidad

| Nivel | Activación | Uso recomendado |
|---|---|---|
| `critical` | **Siempre** — en todos los mensajes | Reglas fundamentales de privacidad y seguridad |
| `high` | Solo cuando `trigger_contexts` coincide | Reglas específicas de dominio (nómina, RRHH) |
| `medium` | Solo cuando `trigger_contexts` coincide | Recordatorios y buenas prácticas |

### Diferencia clave con Habilidades

| | Habilidades | Políticas |
|---|---|---|
| Propósito | Conocimiento adicional | Reglas obligatorias |
| Sin triggers | Siempre activa | Solo activa si es `critical` |
| Posición en prompt | Después de políticas | Antes de habilidades |

---

## Arquitectura Técnica

### Flujo de Inyección en el Chat

```
Usuario envía mensaje
       │
       ▼
sendChatMessage(sessionId, content)
       │
       ├── loadSystemPrompt('chat')      → prompt base de GUADIANA
       ├── getUserContext(userId)         → nombre, rol, departamento, entregables
       ├── loadActivePolicies(content)   → políticas aplicables
       │           ├── severity=critical → SIEMPRE incluida
       │           └── severity=high|medium → si trigger_contexts coincide
       └── loadRelevantSkills(content)   → skills activas relevantes (máx 5)
       │
       ▼
systemPrompt =
  [Contexto del usuario]
  + [⚠️ REGLAS Y POLÍTICAS OBLIGATORIAS]
  + [Habilidades activas]
  + [Prompt base GUADIANA]
```

### Tabla en Base de Datos

```sql
ai_policies (
  id               UUID PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT,              -- Solo para admin, no va al prompt
  policy_type      TEXT,              -- 'privacy' | 'access_control' | 'behavior' | 'compliance'
  content          TEXT NOT NULL,     -- Lo que se inyecta en el system prompt
  severity         TEXT,              -- 'critical' | 'high' | 'medium'
  trigger_contexts TEXT[],            -- Vacío + critical = siempre activa; vacío + no-critical = nunca activa
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
| `src/app/(dashboard)/ia/politicas/page.tsx` | Página con lista de políticas |
| `src/app/(dashboard)/ia/politicas/policies-client.tsx` | UI CRUD (Client Component) |
| `src/app/(dashboard)/ia/politicas/policy-actions.ts` | Server Actions (crear, editar, eliminar, toggle) |
| `src/app/(dashboard)/ia/analyze-actions.ts` | Integración: `loadActivePolicies` + `buildPoliciesBlock` |
| `src/lib/ai/types.ts` | Tipos: `AIPolicy`, `AIPolicyInput`, `AIPolicyType`, `AIPolicySeverity` |

---

## Catálogo de Políticas

> Agregar aquí las políticas que se quieren crear.

---

### 🔵 Políticas Pendientes de Crear

```
Ejemplo de entrada:

#### Nombre de la Política
- **Tipo:** privacy | access_control | behavior | compliance
- **Severidad:** critical | high | medium
- **Contextos:** palabra1, palabra2 (o vacío si es critical)
- **Prioridad:** 80
- **Contenido:**
  Texto de la regla. Usar instrucciones directas: NUNCA, SIEMPRE, DEBES, etc.
  Máximo ~1200 caracteres.
```

#### Privacidad de Datos de Empleados
- **Tipo:** privacy
- **Severidad:** critical
- **Contextos:** (vacío — aplica siempre)
- **Prioridad:** 100
- **Contenido:**
  NUNCA reveles información personal de otros empleados (nombre completo, salario, evaluaciones de desempeño, datos de contacto, historial médico, dirección, o cualquier dato sensible) a menos que:
  1. El usuario solicitante sea un administrador del sistema (rol root)
  2. El usuario tenga el permiso explícito `rrhh.view` para ver datos de personal

  Si alguien solicita información de otro empleado sin los permisos adecuados, responde: "No tengo autorización para compartir información personal de otros colaboradores. Si necesitas esta información, contacta al departamento de Recursos Humanos."

---

### ✅ Políticas Implementadas

*(Aquí se mueven las políticas una vez creadas en la plataforma)*

---

## Buenas Prácticas al Crear Políticas

1. **Usar instrucciones directas:** El agente responde mejor a "NUNCA hagas X" que a "Es preferible no hacer X".

2. **Políticas críticas con moderación:** Solo marcar como `critical` las reglas fundamentales. Si muchas son críticas, el contexto se satura.

3. **Contextos específicos:** Usar palabras que el empleado naturalmente usaría (ej: para nómina: `nómina`, `sueldo`, `quincena`, `pago`).

4. **Incluir la acción alternativa:** Decir qué DEBE hacer el agente cuando no puede cumplir la solicitud ("redirige a RRHH", "explica que no tienes acceso", etc.).

5. **Máximo ~1200 caracteres** por política (≈ 300 tokens).
