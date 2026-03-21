# Reporte de Auditoría RLS – Guadiana Checklists
**Fecha:** 2026-03-20
**Tarea:** T-503
**Herramienta:** MCP Supabase (supaGuadianaObj)

---

## Resultado General

| Criterio | Estado |
|---|---|
| RLS habilitado en todas las tablas del módulo | ✅ |
| Funciones helper SECURITY DEFINER | ✅ |
| Escritura restringida a admin_global | ✅ |
| Aislamiento de datos por respondente | ✅ |
| Visibilidad de admin sobre todos los registros | ✅ (fix aplicado) |
| Sin tablas con RLS deshabilitado | ✅ |

---

## Tablas Auditadas

### 1. `app_profiles`
| Operación | Política | Condición |
|---|---|---|
| SELECT | `Users can view their own profile` | `auth.uid() = id` |
| SELECT | `app_profiles_select_admin` *(nuevo)* | `current_user_role() IN ('admin_global','auditor')` |
| UPDATE | `Users can update their own profile` | `auth.uid() = id` |
| UPDATE | `app_profiles_update_admin` *(nuevo)* | `current_user_role() = 'admin_global'` |

**Bug encontrado y corregido:** Admin/auditor no podían leer perfiles de otros usuarios. Causaba que `/resultados` mostrara IDs truncados en lugar de nombres de respondentes.

---

### 2. `form_surveys`
| Operación | Política | Condición |
|---|---|---|
| SELECT | `form_surveys_select_admin` | `role IN ('admin_global','auditor')` |
| SELECT | `form_surveys_select_published` | `auth.uid() IS NOT NULL AND status = 'published'` |
| INSERT | `form_surveys_insert_admin` | `role = 'admin_global'` |
| UPDATE | `form_surveys_update_admin` | `role = 'admin_global'` |
| DELETE | `form_surveys_delete_admin` | `role = 'admin_global'` |

Estado: ✅ Correcto

---

### 3. `form_sections` / `form_questions` / `form_question_options`
| Operación | Política | Condición |
|---|---|---|
| SELECT | `*_select_auth` | `auth.uid() IS NOT NULL` |
| ALL (write) | `*_write_admin` | `role = 'admin_global'` |

Estado: ✅ Correcto — cualquier usuario autenticado puede leer la estructura del formulario (necesario para ejecutarlo en la app móvil)

---

### 4. `form_assignments`
| Operación | Política | Condición |
|---|---|---|
| SELECT | `form_assignments_select_admin` | `role IN ('admin_global','auditor')` |
| SELECT | `form_assignments_select_jefe` | `role = 'jefe_sucursal' AND branch_id = current_user_branch()` |
| SELECT | `form_assignments_select_user` | `assignee_user_id = auth.uid() OR assignee_role = current_user_role()` |
| ALL (write) | `form_assignments_write_admin` | `role = 'admin_global'` |

Estado: ✅ Correcto — usuarios solo ven sus propias asignaciones

---

### 5. `resp_survey_runs`
| Operación | Política | Condición |
|---|---|---|
| SELECT | `resp_survey_runs_select_admin` | `role IN ('admin_global','auditor')` |
| SELECT | `resp_survey_runs_select_jefe` | `role = 'jefe_sucursal' AND branch_id = current_user_branch()` |
| SELECT | `resp_survey_runs_select_own` | `respondent_id = auth.uid()` |
| INSERT | `resp_survey_runs_insert_auth` | `auth.uid() IS NOT NULL AND respondent_id = auth.uid()` |
| UPDATE | `resp_survey_runs_update_own` | `respondent_id = auth.uid() AND status = 'in_progress'` |

Estado: ✅ Correcto — respondente solo puede actualizar sus propias ejecuciones activas

---

### 6. `resp_answers`
| Operación | Política | Condición |
|---|---|---|
| SELECT | `resp_answers_select_admin` | `role IN ('admin_global','auditor')` |
| SELECT | `resp_answers_select_jefe` | `role = 'jefe_sucursal' AND run.branch_id = current_user_branch()` |
| SELECT | `resp_answers_select_own` | `run.respondent_id = auth.uid()` |
| INSERT | `resp_answers_insert_own` | `run.respondent_id = auth.uid() AND run.status = 'in_progress'` |

Estado: ✅ Correcto — respuestas son inmutables una vez enviadas (no hay UPDATE/DELETE)

---

## Funciones Helper

| Función | SECURITY DEFINER | Volatilidad |
|---|---|---|
| `current_user_role()` | ✅ Sí | STABLE |
| `current_user_branch()` | ✅ Sí | STABLE |

`SECURITY DEFINER` garantiza que las funciones se ejecutan con privilegios del propietario y no pueden ser manipuladas por el invocante. `STABLE` permite que el query planner las optimice correctamente.

---

## Hallazgos y Correcciones

### 🔴 BUG CORREGIDO — `app_profiles`: admin sin acceso a perfiles ajenos
- **Impacto:** `/resultados` mostraba IDs truncados en lugar de nombres de respondentes
- **Causa:** Solo existía `Users can view their own profile` (`auth.uid() = id`)
- **Solución:** Migración `rls_fix_app_profiles_admin_select` aplicada el 2026-03-20
  - `app_profiles_select_admin`: admin_global y auditor pueden leer todos los perfiles
  - `app_profiles_update_admin`: admin_global puede actualizar cualquier perfil

---

## Recomendaciones Futuras

1. **Política INSERT en `app_profiles`**: El registro inicial de perfil se hace via trigger. Considerar agregar policy explícita `WITH CHECK (id = auth.uid())` para reforzar.
2. **DELETE en `resp_survey_runs`**: Actualmente sin política de DELETE (solo admins podrían via service role). Aceptable para MVP, pero considerar soft-delete con campo `deleted_at` a futuro.
3. **Auditoría periódica**: Revisar políticas al agregar nuevas tablas o roles. Ejecutar este reporte como parte del proceso de release.
