# Documento de Diseño - Módulo de Procesos (Flutter App)

**Proyecto**: Aplicación Móvil Guadiana - Módulo de Procesos
**Plataforma**: Flutter (iOS/Android)
**Fecha**: 2025-04-13
**Versión**: 1.0

---

## 1. Arquitectura General

### 1.1 Patrón Arquitectónico

La aplicación seguirá el patrón **Clean Architecture** con separación de capas:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Pages     │  │   Widgets    │  │   State      │     │
│  │   (Routes)   │  │   (UI)       │  │ (Providers)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Entities    │  │  Use Cases   │  │  Repository  │     │
│  │  (Models)    │  │ (Services)   │  │  Interfaces  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Repositories │  │ Data Sources │  │   Local DB   │     │
│  │ (Impl)       │  │ (Supabase)   │  │  (SQLite)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Gestión de Estado

**Provider + Riverpod** para gestión de estado reactivo:

- **AuthNotifier**: Gestiona estado de autenticación
- **FormsNotifier**: Gestiona lista de formularios asignados
- **FormDetailNotifier**: Gestiona formulario actual y respuestas
- **SyncNotifier**: Gestiona estado de sincronización

### 1.3 Navegación

**GoRouter** para navegación declarativa type-safe:

```dart
/go/router.dart:
  /login → LoginPage
  / → redirect to /forms if authenticated
  /forms → FormsListPage
  /forms/:id → FormDetailPage
  /forms/:id/summary → FormSummaryPage
  /profile → ProfilePage
```

---

## 2. Estructura del Proyecto

```
lib/
├── main.dart
├── app.dart
│
├── config/
│   ├── routes.dart              # GoRouter config
│   ├── theme.dart               # Tema de la app
│   └── constants.dart           # Constantes globales
│
├── core/
│   ├── error/
│   │   ├── exceptions.dart
│   │   └── failures.dart
│   ├── network/
│   │   ├── network_info.dart    # Connectivity
│   │   └── api_client.dart      # Supabase client
│   └── utils/
│       ├── logger.dart
│       └── validators.dart
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository_impl.dart
│   │   │   └── datasources/
│   │   │       └── auth_datasource.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login_usecase.dart
│   │   │       ├── logout_usecase.dart
│   │   │       └── get_current_user_usecase.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── auth_provider.dart
│   │       └── pages/
│   │           └── login_page.dart
│   │
│   ├── forms/
│   │   ├── data/
│   │   │   ├── repositories/
│   │   │   │   └── forms_repository_impl.dart
│   │   │   ├── models/
│   │   │   │   ├── form_survey_model.dart
│   │   │   │   ├── form_assignment_model.dart
│   │   │   │   ├── form_section_model.dart
│   │   │   │   ├── form_question_model.dart
│   │   │   │   ├── survey_run_model.dart
│   │   │   │   └── answer_model.dart
│   │   │   └── datasources/
│   │   │       ├── forms_local_datasource.dart  # SQLite
│   │   │       └── forms_remote_datasource.dart # Supabase
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── form_survey.dart
│   │   │   │   ├── form_assignment.dart
│   │   │   │   ├── form_section.dart
│   │   │   │   ├── form_question.dart
│   │   │   │   ├── survey_run.dart
│   │   │   │   └── answer.dart
│   │   │   ├── repositories/
│   │   │   │   └── forms_repository.dart
│   │   │   └── usecases/
│   │   │       ├── get_assigned_forms_usecase.dart
│   │   │       ├── get_form_detail_usecase.dart
│   │   │       ├── save_answer_usecase.dart
│   │   │       ├── complete_survey_run_usecase.dart
│   │   │       └── get_progress_usecase.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   ├── forms_provider.dart
│   │       │   └── form_detail_provider.dart
│   │       ├── pages/
│   │       │   ├── forms_list_page.dart
│   │       │   ├── form_detail_page.dart
│   │       │   └── form_summary_page.dart
│   │       └── widgets/
│   │           ├── form_card.dart
│   │           ├── question_widget.dart
│   │           ├── section_widget.dart
│   │           └── progress_bar.dart
│   │
│   ├── sync/
│   │   ├── data/
│   │   │   ├── repositories/
│   │   │   │   └── sync_repository_impl.dart
│   │   │   └── datasources/
│   │   │       └── sync_datasource.dart
│   │   ├── domain/
│   │   │   ├── usecases/
│   │   │   │   ├── sync_pending_data_usecase.dart
│   │   │   │   └── get_sync_status_usecase.dart
│   │   │   └── entities/
│   │   │       └── sync_status.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── sync_provider.dart
│   │       └── widgets/
│   │           └── sync_indicator.dart
│   │
│   └── profile/
│       ├── presentation/
│       │   ├── pages/
│       │   │   └── profile_page.dart
│       │   └── widgets/
│       │       └── user_info_card.dart
│
├── services/
│   ├── supabase_client.dart      # Singleton Supabase
│   ├── database_service.dart     # SQLite service
│   └── notification_service.dart # Local notifications
│
└── l10n/
    ├── app_es.arb                # Español
    └── app_en.arb                # English
```

---

## 3. Modelo de Datos

### 3.1 Entidades de Dominio

#### FormSurvey (form_surveys)
```dart
class FormSurvey {
  final String id;
  final String name;
  final String? description;
  final String? code;
  final FormStatus status;          // draft, published, archived
  final String? category;
  final String? targetRole;
  final int version;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Relaciones (cargadas bajo demanda)
  List<FormSection>? sections;
}
```

#### FormAssignment (form_assignments)
```dart
class FormAssignment {
  final String id;
  final String surveyId;
  final String? assigneeUserId;
  final String? assigneeRole;
  final String? branchId;
  final AssignmentFrequency? requiredFrequency;
  final DateTime? startDate;
  final DateTime? endDate;
  final bool isActive;
  final DateTime createdAt;

  // Relaciones
  FormSurvey? survey;
  SurveyRun? latestRun;             // Última ejecución del usuario
}
```

#### FormSection (form_sections)
```dart
class FormSection {
  final String id;
  final String surveyId;
  final String title;
  final String? description;
  final int order;
  final DateTime createdAt;

  // Relaciones
  List<FormQuestion>? questions;
}
```

#### FormQuestion (form_questions)
```dart
class FormQuestion {
  final String id;
  final String sectionId;
  final String label;
  final String? description;
  final QuestionType type;          // boolean, single_choice, multiple_choice, text_short, text_long, number, date
  final bool required;
  final int order;
  final String? placeholder;
  final String? helpText;
  final Map<String, dynamic>? metadata;

  // Relaciones
  List<FormQuestionOption>? options;
}
```

#### FormQuestionOption (form_question_options)
```dart
class FormQuestionOption {
  final String id;
  final String questionId;
  final String label;
  final String? value;
  final double? score;
  final int order;
  final bool isDefault;
}
```

#### SurveyRun (resp_survey_runs)
```dart
class SurveyRun {
  final String id;
  final String surveyId;
  final String? assignmentId;
  final String respondentId;
  final String? auditedUserId;
  final String? branchId;
  final Map<String, dynamic>? context;
  final DateTime startedAt;
  final DateTime? completedAt;
  final RunStatus status;            // in_progress, completed, cancelled
  final String? deviceInfo;
  final DateTime createdAt;

  // Relaciones
  List<Answer>? answers;
}
```

#### Answer (resp_answers)
```dart
class Answer {
  final String id;
  final String runId;
  final String questionId;
  final String? optionId;
  final String? valueText;
  final double? valueNumber;
  final bool? valueBool;
  final DateTime? valueDate;
  final Map<String, dynamic>? valueJson;
  final bool notApplicable;
  final String? comment;
  final DateTime createdAt;
}
```

### 3.2 Enums

```dart
enum FormStatus { draft, published, archived }
enum QuestionType { boolean, singleChoice, multipleChoice, textShort, textLong, number, date }
enum RunStatus { inProgress, completed, cancelled }
enum AssignmentFrequency { daily, weekly, monthly, once }
```

---

## 4. Base de Datos Local (SQLite)

### 4.1 Esquema Local

```sql
-- Tabla: forms_cache (cache de formularios)
CREATE TABLE forms_cache (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT,
  status TEXT NOT NULL,
  category TEXT,
  target_role TEXT,
  version INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT NOT NULL
);

-- Tabla: assignments_cache (cache de asignaciones)
CREATE TABLE assignments_cache (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  assignee_user_id TEXT,
  assignee_role TEXT,
  branch_id TEXT,
  start_date TEXT,
  end_date TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  synced_at TEXT NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES forms_cache(id)
);

-- Tabla: survey_runs_local (respuestas locales)
CREATE TABLE survey_runs_local (
  id TEXT PRIMARY KEY,
  survey_id TEXT NOT NULL,
  assignment_id TEXT,
  status TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  needs_sync INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES forms_cache(id)
);

-- Tabla: answers_local (respuestas locales)
CREATE TABLE answers_local (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  option_id TEXT,
  value_text TEXT,
  value_number REAL,
  value_bool INTEGER,
  value_date TEXT,
  value_json TEXT,
  not_applicable INTEGER NOT NULL DEFAULT 0,
  comment TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (run_id) REFERENCES survey_runs_local(id) ON DELETE CASCADE
);
```

### 4.2 Índices

```sql
CREATE INDEX idx_assignments_survey ON assignments_cache(survey_id);
CREATE INDEX idx_runs_survey ON survey_runs_local(survey_id);
CREATE INDEX idx_answers_run ON answers_local(run_id);
CREATE INDEX idx_runs_needs_sync ON survey_runs_local(needs_sync);
```

---

## 5. Integración con Supabase

### 5.1 Cliente Supabase

```dart
// services/supabase_client.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseClient {
  static final SupabaseClient _instance = SupabaseClient._internal();
  factory SupabaseClient() => _instance;

  SupabaseClient._internal();

  late final Supabase _client;

  Future<void> initialize() async {
    await Supabase.initialize(
      url: dotenv.env['SUPABASE_URL']!,
      anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
    );
    _client = Supabase.instance.client;
  }

  Supabase get client => _client;

  // Auth shortcuts
  Future<AuthResponse> signInWithEmail(String email, String password) =>
    _client.auth.signInWithPassword(email: email, password: password);

  Future<void> signOut() => _client.auth.signOut();

  User? get currentUser => _client.auth.currentUser;

  // Database shortcuts
  PostgresRestCall get from(String table) => _client.from(table);

  // RPC shortcuts
  Future<List> rpc(String functionName, {Map<String, dynamic>? params}) =>
    _client.rpc(functionName, params: params);
}
```

### 5.2 Queries Principales

#### Obtener Asignaciones del Usuario
```dart
Future<List<FormAssignment>> getAssignedForms(String userId, String userRole) async {
  final response = await SupabaseClient().client
    .from('form_assignments')
    .select('''
      id,
      survey_id,
      assignee_user_id,
      assignee_role,
      start_date,
      end_date,
      is_active,
      created_at,
      form_surveys (
        id,
        name,
        description,
        status,
        version
      )
    ''')
    .or('and(assignee_user_id.eq.$userId, assignee_role.eq.$userRole)')
    .eq('is_active', true)
    .order('created_at', ascending: false);

  return (response.data as List)
    .map((json) => FormAssignmentModel.fromJson(json))
    .toList();
}
```

#### Obtener Detalle de Formulario
```dart
Future<FormSurvey> getFormDetail(String surveyId) async {
  final response = await SupabaseClient().client
    .from('form_surveys')
    .select('''
      id,
      name,
      description,
      status,
      version,
      form_sections (
        id,
        title,
        description,
        order,
        form_questions (
          id,
          label,
          description,
          type,
          required,
          order,
          placeholder,
          help_text,
          metadata,
          form_question_options (
            id,
            label,
            value,
            score,
            order,
            is_default
          )
        )
      )
    ''')
    .eq('id', surveyId)
    .single();

  return FormSurveyModel.fromJson(response.data);
}
```

#### Crear SurveyRun
```dart
Future<SurveyRun> createSurveyRun(String surveyId, String assignmentId) async {
  final userId = SupabaseClient().currentUser!.id;

  final response = await SupabaseClient().client
    .from('resp_survey_runs')
    .insert({
      'survey_id': surveyId,
      'assignment_id': assignmentId,
      'respondent_id': userId,
      'status': 'in_progress',
      'device_info': await _getDeviceInfo(),
    })
    .select()
    .single();

  return SurveyRunModel.fromJson(response.data);
}
```

#### Guardar Respuestas
```dart
Future<void> saveAnswers(String runId, List<Answer> answers) async {
  final answersData = answers.map((a) => AnswerModel.toJson(a)).toList();

  await SupabaseClient().client
    .from('resp_answers')
    .insert(answersData);
}
```

#### Completar SurveyRun
```dart
Future<void> completeSurveyRun(String runId) async {
  await SupabaseClient().client
    .from('resp_survey_runs')
    .update({
      'status': 'completed',
      'completed_at': DateTime.now().toIso8601String(),
    })
    .eq('id', runId);
}
```

---

## 6. UI/UX Design

### 6.1 Design System

**Material Design 3** con personalización de colores:

```dart
// config/theme.dart
class AppTheme {
  static ThemeData get light {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF004B8D), // Guadiana blue
        brightness: Brightness.light,
      ),
      fontFamily: 'Roboto',
    );
  }

  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF004B8D),
        brightness: Brightness.dark,
      ),
      fontFamily: 'Roboto',
    );
  }
}
```

### 6.2 Componentes Principales

#### Login Page
```dart
// features/auth/presentation/pages/login_page.dart
class LoginPage extends ConsumerStatefulWidget {
  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await ref.read(authProvider.notifier).login(
        _emailController.text.trim(),
        _passwordController.text,
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                Icon(Icons.assignment, size: 80, color: Theme.of(context).colorScheme.primary),
                const SizedBox(height: 24),
                Text('Guadiana Procesos', style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 48),

                // Email field
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) => value!.isValidEmail() ? null : 'Email inválido',
                ),
                const SizedBox(height: 16),

                // Password field
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(
                    labelText: 'Contraseña',
                    prefixIcon: Icon(Icons.lock),
                  ),
                  obscureText: true,
                  validator: (value) => value!.length >= 6 ? null : 'Mínimo 6 caracteres',
                ),
                const SizedBox(height: 24),

                // Login button
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Iniciar Sesión'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

#### Forms List Page
```dart
// features/forms/presentation/pages/forms_list_page.dart
class FormsListPage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final formsAsync = ref.watch(assignedFormsProvider);
    final syncStatus = ref.watch(syncStatusProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Formularios'),
        actions: [
          // Sync indicator
          if (syncStatus.value?.hasPending == true)
            IconButton(
              icon: const Icon(Icons.sync),
              onPressed: () => ref.read(syncProvider.notifier).syncNow(),
            ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.go('/profile'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(assignedFormsProvider.notifier).refresh(),
        child: formsAsync.when(
          data: (forms) => forms.isEmpty
              ? _buildEmptyState()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: forms.length,
                  itemBuilder: (context, index) => FormCard(form: forms[index]),
                ),
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, stack) => _buildErrorState(err, context, ref),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.assignment_outlined, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            'No tienes formularios asignados',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}
```

#### Form Card Widget
```dart
// features/forms/presentation/widgets/form_card.dart
class FormCard extends StatelessWidget {
  final FormAssignment form;

  const FormCard({super.key, required this.form});

  @override
  Widget build(BuildContext context) {
    final progress = form.latestRun?.progress ?? 0.0;
    final status = _getStatus(progress);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => context.go('/forms/${form.surveyId}'),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      form.survey?.name ?? 'Sin nombre',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                  ),
                  _StatusChip(status: status),
                ],
              ),
              if (form.survey?.description != null) ...[
                const SizedBox(height: 8),
                Text(
                  form.survey!.description!,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(color: Colors.grey[600]),
                ),
              ],
              const SizedBox(height: 16),
              LinearProgressIndicator(value: progress),
              const SizedBox(height: 8),
              Text(
                '${(progress * 100).toInt()}% completado',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }

  FormStatus _getStatus(double progress) {
    if (progress == 0) return FormStatus.notStarted;
    if (progress < 1) return FormStatus.inProgress;
    return FormStatus.completed;
  }
}

enum FormStatus { notStarted, inProgress, completed }

class _StatusChip extends StatelessWidget {
  final FormStatus status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final labels = {
      FormStatus.notStarted: 'No iniciado',
      FormStatus.inProgress: 'En progreso',
      FormStatus.completed: 'Completado',
    };

    final colors = {
      FormStatus.notStarted: Colors.grey,
      FormStatus.inProgress: Colors.orange,
      FormStatus.completed: Colors.green,
    };

    return Chip(
      label: Text(labels[status]!),
      backgroundColor: colors[status]!.withOpacity(0.1),
      labelStyle: TextStyle(color: colors[status], fontSize: 12),
    );
  }
}
```

#### Question Widget
```dart
// features/forms/presentation/widgets/question_widget.dart
class QuestionWidget extends ConsumerStatefulWidget {
  final FormQuestion question;
  final Answer? initialAnswer;

  const QuestionWidget({super.key, required this.question, this.initialAnswer});

  @override
  ConsumerState<QuestionWidget> createState() => _QuestionWidgetState();
}

class _QuestionWidgetState extends ConsumerState<QuestionWidget> {
  late Answer _currentAnswer;

  @override
  void initState() {
    super.initState();
    _currentAnswer = widget.initialAnswer ?? Answer.empty(widget.question.id);
  }

  void _updateAnswer(dynamic value) {
    setState(() {
      _currentAnswer = _currentAnswer.copyWith(value: value);
    });
    ref.read(formDetailProvider.notifier).saveAnswer(_currentAnswer);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    widget.question.label,
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                ),
                if (widget.question.required)
                  const Icon(Icons.star, size: 16, color: Colors.red),
              ],
            ),
            if (widget.question.description != null) ...[
              const SizedBox(height: 8),
              Text(
                widget.question.description!,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
            const SizedBox(height: 16),
            _buildQuestionInput(),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionInput() {
    switch (widget.question.type) {
      case QuestionType.boolean:
        return SwitchListTile(
          value: _currentAnswer.valueBool ?? false,
          onChanged: (value) => _updateAnswer(value),
          title: Text(_currentAnswer.valueBool == true ? 'Sí' : 'No'),
        );

      case QuestionType.singleChoice:
        return Column(
          children: widget.question.options!.map((opt) {
            return RadioListTile<String>(
              title: Text(opt.label),
              value: opt.value ?? opt.id,
              groupValue: _currentAnswer.valueText,
              onChanged: (value) => value != null ? _updateAnswer(value) : null,
            );
          }).toList(),
        );

      case QuestionType.multipleChoice:
        return Column(
          children: widget.question.options!.map((opt) {
            final selected = (_currentAnswer.valueJson as List?)?.contains(opt.value ?? opt.id) ?? false;
            return CheckboxListTile(
              title: Text(opt.label),
              value: selected,
              onChanged: (_) => _toggleMultipleChoice(opt.value ?? opt.id),
            );
          }).toList(),
        );

      case QuestionType.textShort:
        return TextField(
          initialValue: _currentAnswer.valueText,
          decoration: InputDecoration(
            hintText: widget.question.placeholder,
          ),
          onChanged: (value) => _updateAnswer(value),
        );

      case QuestionType.textLong:
        return TextField(
          initialValue: _currentAnswer.valueText,
          decoration: InputDecoration(
            hintText: widget.question.placeholder,
          ),
          maxLines: 5,
          onChanged: (value) => _updateAnswer(value),
        );

      case QuestionType.number:
        return TextField(
          initialValue: _currentAnswer.valueNumber?.toString(),
          decoration: InputDecoration(
            hintText: widget.question.placeholder,
          ),
          keyboardType: TextInputType.number,
          onChanged: (value) => _updateAnswer(double.tryParse(value)),
        );

      case QuestionType.date:
        return ListTile(
          title: Text(_currentAnswer.valueDate != null
            ? DateFormat('dd/MM/yyyy').format(DateTime.parse(_currentAnswer.valueDate!))
            : 'Seleccionar fecha'),
          trailing: const Icon(Icons.calendar_today),
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: DateTime.now(),
              firstDate: DateTime(2000),
              lastDate: DateTime(2100),
            );
            if (date != null) {
              _updateAnswer(date.toIso8601String());
            }
          },
        );
    }
  }

  void _toggleMultipleChoice(String value) {
    final current = (_currentAnswer.valueJson as List?) ?? [];
    if (current.contains(value)) {
      current.remove(value);
    } else {
      current.add(value);
    }
    _updateAnswer(current);
  }
}
```

---

## 7. Sincronización Offline-First

### 7.1 Estrategia de Sincronización

```dart
// features/sync/domain/usecases/sync_pending_data_usecase.dart
class SyncPendingDataUseCase {
  final SyncRepository _repository;

  SyncPendingDataUseCase(this._repository);

  Future<void> call() async {
    final pendingRuns = await _repository.getPendingRuns();

    for (final run in pendingRuns) {
      try {
        // 1. Crear o actualizar run en Supabase
        final remoteRunId = await _repository.syncRun(run);

        // 2. Sincronizar respuestas
        final answers = await _repository.getAnswers(run.id);
        await _repository.syncAnswers(remoteRunId, answers);

        // 3. Marcar como sincronizado
        await _repository.markRunAsSynced(run.id);
      } catch (e) {
        // Continuar con siguiente, marcar error
        await _repository.markRunWithError(run.id, e.toString());
      }
    }
  }
}
```

### 7.2 Detección de Conectividad

```dart
// core/network/network_info.dart
class NetworkInfo {
  final Connectivity _connectivity;

  NetworkInfo(this._connectivity);

  Future<bool> get isConnected async {
    final result = await _connectivity.checkConnectivity();
    return result.contains(ConnectivityResult.none) == false;
  }

  Stream<bool> get onConnectivityChange {
    return _connectivity.onConnectivityChanged.map((result) {
      return !result.contains(ConnectivityResult.none);
    });
  }
}
```

---

## 8. Seguridad

### 8.1 Almacenamiento Seguro

```dart
// services/secure_storage_service.dart
class SecureStorageService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> saveToken(String token) async {
    await _storage.write(key: 'auth_token', value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: 'auth_token');
  }

  Future<void> deleteToken() async {
    await _storage.delete(key: 'auth_token');
  }
}
```

### 8.2 Validaciones

```dart
// core/utils/validators.dart
class Validators {
  static final _emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');

  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) return 'Email requerido';
    if (!_emailRegex.hasMatch(value)) return 'Email inválido';
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Contraseña requerida';
    if (value.length < 6) return 'Mínimo 6 caracteres';
    return null;
  }
}
```

---

## 9. Testing

### 9.1 Unit Tests

```dart
// test/features/forms/domain/usecases/get_assigned_forms_usecase_test.dart
void main() {
  late GetAssignedFormsUseCase useCase;
  late MockFormsRepository mockRepository;

  setUp(() {
    mockRepository = MockFormsRepository();
    useCase = GetAssignedFormsUseCase(mockRepository);
  });

  test('should return list of forms from repository', () async {
    // arrange
    final tForms = [MockData.formAssignment];
    when(mockRepository.getAssignedForms(any, any))
      .thenAnswer((_) async => Right(tForms));

    // act
    final result = await useCase(userId: '123', userRole: 'asesor');

    // assert
    expect(result, Right(tForms));
    verify(mockRepository.getAssignedForms('123', 'asesor'));
    verifyNoMoreInteractions(mockRepository);
  });
}
```

### 9.2 Widget Tests

```dart
// test/features/forms/presentation/widgets/question_widget_test.dart
void main() {
  testWidgets('should render text input for text_short question', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: QuestionWidget(
          question: MockData.textShortQuestion,
        ),
      ),
    );

    expect(find.text('Question label'), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
  });
}
```

---

## 10. Deployment

### 10.1 Build Commands

```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release
```

### 10.2 Environment Variables

```bash
# .env.production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## 11. Referencias

- **Clean Architecture**: Robert C. Martin
- **Flutter Documentation**: https://flutter.dev/docs
- **Supabase Flutter SDK**: https://supabase.com/docs/guides/flutter
- **Material Design 3**: https://m3.material.io/
