export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_analysis_results: {
        Row: {
          confidence: number | null
          created_at: string | null
          deliverable_id: string
          evidence_ids: string[]
          findings: Json | null
          human_verdict: string | null
          id: string
          model_used: string | null
          prompt_used: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          summary: string | null
          verdict: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          deliverable_id: string
          evidence_ids?: string[]
          findings?: Json | null
          human_verdict?: string | null
          id?: string
          model_used?: string | null
          prompt_used?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          summary?: string | null
          verdict: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          deliverable_id?: string
          evidence_ids?: string[]
          findings?: Json | null
          human_verdict?: string | null
          id?: string
          model_used?: string | null
          prompt_used?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          summary?: string | null
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_results_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "objective_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_analysis_results_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          context: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          system_prompt: string
          updated_at: string | null
        }
        Insert: {
          context?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          system_prompt: string
          updated_at?: string | null
        }
        Update: {
          context?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          system_prompt?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_profiles: {
        Row: {
          assigned_warehouse: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_warehouse?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_warehouse?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conteo_inventario: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          session_id: string | null
          system_stock: number | null
          updated_at: string | null
          user_id: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          session_id?: string | null
          system_stock?: number | null
          updated_at?: string | null
          user_id?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          session_id?: string | null
          system_stock?: number | null
          updated_at?: string | null
          user_id?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conteo_inventario_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "inventory_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_assignments: {
        Row: {
          assignee_role: string | null
          assignee_user_id: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean
          required_frequency: string | null
          start_date: string | null
          survey_id: string
        }
        Insert: {
          assignee_role?: string | null
          assignee_user_id?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          required_frequency?: string | null
          start_date?: string | null
          survey_id: string
        }
        Update: {
          assignee_role?: string | null
          assignee_user_id?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          required_frequency?: string | null
          start_date?: string | null
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_assignments_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "form_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      form_conditions: {
        Row: {
          action: string
          condition_value: string
          created_at: string | null
          id: string
          source_option_id: string | null
          source_question_id: string
          survey_id: string
          target_question_id: string | null
          target_section_id: string | null
        }
        Insert: {
          action?: string
          condition_value: string
          created_at?: string | null
          id?: string
          source_option_id?: string | null
          source_question_id: string
          survey_id: string
          target_question_id?: string | null
          target_section_id?: string | null
        }
        Update: {
          action?: string
          condition_value?: string
          created_at?: string | null
          id?: string
          source_option_id?: string | null
          source_question_id?: string
          survey_id?: string
          target_question_id?: string | null
          target_section_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_conditions_source_option_id_fkey"
            columns: ["source_option_id"]
            isOneToOne: false
            referencedRelation: "form_question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_conditions_source_question_id_fkey"
            columns: ["source_question_id"]
            isOneToOne: false
            referencedRelation: "form_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_conditions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "form_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_conditions_target_question_id_fkey"
            columns: ["target_question_id"]
            isOneToOne: false
            referencedRelation: "form_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_conditions_target_section_id_fkey"
            columns: ["target_section_id"]
            isOneToOne: false
            referencedRelation: "form_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      form_question_options: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          label: string
          order: number
          question_id: string
          score: number | null
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          label: string
          order?: number
          question_id: string
          score?: number | null
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string
          order?: number
          question_id?: string
          score?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "form_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      form_questions: {
        Row: {
          created_at: string
          description: string | null
          help_text: string | null
          id: string
          label: string
          metadata: Json | null
          order: number
          placeholder: string | null
          required: boolean
          section_id: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          help_text?: string | null
          id?: string
          label: string
          metadata?: Json | null
          order?: number
          placeholder?: string | null
          required?: boolean
          section_id: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          help_text?: string | null
          id?: string
          label?: string
          metadata?: Json | null
          order?: number
          placeholder?: string | null
          required?: boolean
          section_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "form_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      form_sections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order: number
          survey_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          survey_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          survey_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_sections_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "form_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      form_surveys: {
        Row: {
          ai_context: string
          category: string | null
          code: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_template: boolean
          name: string
          status: string
          target_role: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          ai_context?: string
          category?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean
          name: string
          status?: string
          target_role?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          ai_context?: string
          category?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_template?: boolean
          name?: string
          status?: string
          target_role?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      incentive_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          base_amount: number
          bonus_pct: number
          calculated_amount: number
          completion_pct: number
          created_at: string | null
          department_id: string
          id: string
          month: number
          notes: string | null
          schema_id: string | null
          status: string
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount: number
          bonus_pct?: number
          calculated_amount: number
          completion_pct?: number
          created_at?: string | null
          department_id: string
          id?: string
          month: number
          notes?: string | null
          schema_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          base_amount?: number
          bonus_pct?: number
          calculated_amount?: number
          completion_pct?: number
          created_at?: string | null
          department_id?: string
          id?: string
          month?: number
          notes?: string | null
          schema_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "incentive_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_records_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_records_schema_id_fkey"
            columns: ["schema_id"]
            isOneToOne: false
            referencedRelation: "incentive_schemas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      incentive_schemas: {
        Row: {
          base_amount: number
          created_at: string | null
          created_by: string | null
          department_id: string | null
          id: string
          is_active: boolean
          role_id: string | null
          tiers: Json
          updated_at: string | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          base_amount: number
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean
          role_id?: string | null
          tiers?: Json
          updated_at?: string | null
          valid_from: string
          valid_to?: string | null
        }
        Update: {
          base_amount?: number
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean
          role_id?: string | null
          tiers?: Json
          updated_at?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incentive_schemas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_schemas_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incentive_schemas_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario: {
        Row: {
          Almacen: string
          Categoria: string | null
          CostoEstandar: number | null
          CostoPromedio: number | null
          Descripcion: string | null
          DiasSinCompra: number | null
          DiasSinVenta: number | null
          Disponible: number | null
          Entrada: number | null
          Existencia: number | null
          FechaUltimaCompra: string | null
          FechaUltimaVenta: string | null
          Inactivo: boolean | null
          Linea: string | null
          Marca: string | null
          Modelo: string | null
          "Orden Por Surtir": number | null
          "Por Surtir": number | null
          ProductId: string
          Producto: string | null
          Rango: string | null
          Salida: number | null
          servidor_origen: string | null
          StockMax: number | null
          StockMin: number | null
          StockReorden: number | null
          Subcategoria1: string | null
          Sublinea: string | null
          Tipo: string | null
          UltimoCosto: number | null
          UMB: string | null
          UPCCode: string | null
          ValorStock: number | null
        }
        Insert: {
          Almacen: string
          Categoria?: string | null
          CostoEstandar?: number | null
          CostoPromedio?: number | null
          Descripcion?: string | null
          DiasSinCompra?: number | null
          DiasSinVenta?: number | null
          Disponible?: number | null
          Entrada?: number | null
          Existencia?: number | null
          FechaUltimaCompra?: string | null
          FechaUltimaVenta?: string | null
          Inactivo?: boolean | null
          Linea?: string | null
          Marca?: string | null
          Modelo?: string | null
          "Orden Por Surtir"?: number | null
          "Por Surtir"?: number | null
          ProductId: string
          Producto?: string | null
          Rango?: string | null
          Salida?: number | null
          servidor_origen?: string | null
          StockMax?: number | null
          StockMin?: number | null
          StockReorden?: number | null
          Subcategoria1?: string | null
          Sublinea?: string | null
          Tipo?: string | null
          UltimoCosto?: number | null
          UMB?: string | null
          UPCCode?: string | null
          ValorStock?: number | null
        }
        Update: {
          Almacen?: string
          Categoria?: string | null
          CostoEstandar?: number | null
          CostoPromedio?: number | null
          Descripcion?: string | null
          DiasSinCompra?: number | null
          DiasSinVenta?: number | null
          Disponible?: number | null
          Entrada?: number | null
          Existencia?: number | null
          FechaUltimaCompra?: string | null
          FechaUltimaVenta?: string | null
          Inactivo?: boolean | null
          Linea?: string | null
          Marca?: string | null
          Modelo?: string | null
          "Orden Por Surtir"?: number | null
          "Por Surtir"?: number | null
          ProductId?: string
          Producto?: string | null
          Rango?: string | null
          Salida?: number | null
          servidor_origen?: string | null
          StockMax?: number | null
          StockMin?: number | null
          StockReorden?: number | null
          Subcategoria1?: string | null
          Sublinea?: string | null
          Tipo?: string | null
          UltimoCosto?: number | null
          UMB?: string | null
          UPCCode?: string | null
          ValorStock?: number | null
        }
        Relationships: []
      }
      inventory_sessions: {
        Row: {
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          status: string
          warehouse_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          status?: string
          warehouse_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          status?: string
          warehouse_id?: string
        }
        Relationships: []
      }
      lms_content: {
        Row: {
          category: string | null
          content_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean | null
          storage_path: string | null
          text_body: string | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          category?: string | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          storage_path?: string | null
          text_body?: string | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          storage_path?: string | null
          text_body?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_paths: {
        Row: {
          cert_title: string | null
          content_ids: string[]
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cert_title?: string | null
          content_ids?: string[]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cert_title?: string | null
          content_ids?: string[]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lms_paths_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_progress: {
        Row: {
          certified: boolean | null
          completed_at: string | null
          content_id: string | null
          id: string
          path_id: string | null
          quiz_score: number | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          certified?: boolean | null
          completed_at?: string | null
          content_id?: string | null
          id?: string
          path_id?: string | null
          quiz_score?: number | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          certified?: boolean | null
          completed_at?: string | null
          content_id?: string | null
          id?: string
          path_id?: string | null
          quiz_score?: number | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lms_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "lms_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_progress_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "lms_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lms_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lms_quizzes: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          min_score: number | null
          questions: Json
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          min_score?: number | null
          questions?: Json
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          min_score?: number | null
          questions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lms_quizzes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: true
            referencedRelation: "lms_content"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_pairs: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_date: string | null
          id: string
          is_active: boolean
          mentee_id: string
          mentor_id: string
          objectives: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          mentee_id: string
          mentor_id: string
          objectives?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          mentee_id?: string
          mentor_id?: string
          objectives?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_pairs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_pairs_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_pairs_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_sessions: {
        Row: {
          agenda: string | null
          commitments: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          mentee_feedback: string | null
          mentee_rating: number | null
          mentor_notes: string | null
          mentor_rating: number | null
          modality: string
          objective_id: string | null
          pair_id: string
          scheduled_at: string
          status: string
          topics_covered: string[] | null
          updated_at: string | null
        }
        Insert: {
          agenda?: string | null
          commitments?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mentee_feedback?: string | null
          mentee_rating?: number | null
          mentor_notes?: string | null
          mentor_rating?: number | null
          modality?: string
          objective_id?: string | null
          pair_id: string
          scheduled_at: string
          status?: string
          topics_covered?: string[] | null
          updated_at?: string | null
        }
        Update: {
          agenda?: string | null
          commitments?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mentee_feedback?: string | null
          mentee_rating?: number | null
          mentor_notes?: string | null
          mentor_rating?: number | null
          modality?: string
          objective_id?: string | null
          pair_id?: string
          scheduled_at?: string
          status?: string
          topics_covered?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_sessions_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentoring_sessions_pair_id_fkey"
            columns: ["pair_id"]
            isOneToOne: false
            referencedRelation: "mentoring_pairs"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_deliverables: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          objective_id: string
          status: string
          title: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          objective_id: string
          status?: string
          title: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          objective_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "objective_deliverables_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objective_deliverables_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_evidences: {
        Row: {
          deliverable_id: string
          evidence_url: string | null
          id: string
          notes: string | null
          run_id: string | null
          storage_path: string | null
          submitted_at: string | null
          submitted_by: string
          text_content: string | null
        }
        Insert: {
          deliverable_id: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          run_id?: string | null
          storage_path?: string | null
          submitted_at?: string | null
          submitted_by: string
          text_content?: string | null
        }
        Update: {
          deliverable_id?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          run_id?: string | null
          storage_path?: string | null
          submitted_at?: string | null
          submitted_by?: string
          text_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objective_evidences_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "objective_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objective_evidences_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "resp_survey_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objective_evidences_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_progress: {
        Row: {
          calculated_at: string | null
          completion_pct: number | null
          department_id: string
          id: string
          month: number
          objective_id: string
          year: number
        }
        Insert: {
          calculated_at?: string | null
          completion_pct?: number | null
          department_id: string
          id?: string
          month: number
          objective_id: string
          year: number
        }
        Update: {
          calculated_at?: string | null
          completion_pct?: number | null
          department_id?: string
          id?: string
          month?: number
          objective_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "objective_progress_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objective_progress_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "objectives"
            referencedColumns: ["id"]
          },
        ]
      }
      objective_reviews: {
        Row: {
          comment: string | null
          deliverable_id: string
          id: string
          reviewed_at: string | null
          reviewer_id: string
          verdict: string
        }
        Insert: {
          comment?: string | null
          deliverable_id: string
          id?: string
          reviewed_at?: string | null
          reviewer_id: string
          verdict: string
        }
        Update: {
          comment?: string | null
          deliverable_id?: string
          id?: string
          reviewed_at?: string | null
          reviewer_id?: string
          verdict?: string
        }
        Relationships: [
          {
            foreignKeyName: "objective_reviews_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "objective_deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objective_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      objectives: {
        Row: {
          checklist_id: string | null
          created_at: string | null
          created_by: string | null
          department_id: string
          description: string | null
          evidence_type: string
          id: string
          month: number
          status: string
          target_value: number | null
          title: string
          updated_at: string | null
          weight: number
          year: number
        }
        Insert: {
          checklist_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id: string
          description?: string | null
          evidence_type?: string
          id?: string
          month: number
          status?: string
          target_value?: number | null
          title: string
          updated_at?: string | null
          weight?: number
          year: number
        }
        Update: {
          checklist_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string
          description?: string | null
          evidence_type?: string
          id?: string
          month?: number
          status?: string
          target_value?: number | null
          title?: string
          updated_at?: string | null
          weight?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "objectives_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "form_surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "objectives_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      okcar_clientesview: {
        Row: {
          clave: string | null
          direccion: string | null
          fechaalta: string | null
          id: number
          razonsocial: string | null
          rfc: string | null
          servidororigen: string | null
        }
        Insert: {
          clave?: string | null
          direccion?: string | null
          fechaalta?: string | null
          id?: number
          razonsocial?: string | null
          rfc?: string | null
          servidororigen?: string | null
        }
        Update: {
          clave?: string | null
          direccion?: string | null
          fechaalta?: string | null
          id?: number
          razonsocial?: string | null
          rfc?: string | null
          servidororigen?: string | null
        }
        Relationships: []
      }
      okcar_comprobantesconceptos: {
        Row: {
          almacen: string | null
          ancho: string | null
          cancelada: boolean | null
          cantidad: string | null
          categoria: string | null
          clienteclave: string | null
          clienterazon: string | null
          comentario: string | null
          comentarios: string | null
          comprobante: string | null
          costo: string | null
          costoneto: string | null
          costototal: string | null
          cuentacontable: string | null
          descripcion: string | null
          descuento: string | null
          empresa: string | null
          estatus: string | null
          fecha: string | null
          fechamodificacion: string | null
          folio: string | null
          id: number
          ieps: string | null
          importe: string | null
          importeieps: string | null
          importeiva: string | null
          importeneto: string | null
          impuestos: string | null
          iva: string | null
          linea: string | null
          listaprecio: string | null
          marca: string | null
          marcamodelo: string | null
          medidallantas: string | null
          moneda: string | null
          noeconomico: string | null
          odometro: string | null
          operador: string | null
          operadorcomision: string | null
          placas: string | null
          precio: string | null
          preciocatalogo: string | null
          productid: string | null
          producto: string | null
          producttype: string | null
          proveedorclave: string | null
          proveedorrazon: string | null
          rango: string | null
          referencia: string | null
          rfc: string | null
          rin: string | null
          serie: string | null
          servidororigen: string | null
          subcategoria: string | null
          sublinea: string | null
          sucursal: string | null
          tipo: string | null
          tipocambio: string | null
          tipocomprobante: string | null
          tipoegreso: string | null
          tipovehiculo: string | null
          ultimocosto: string | null
          unidadmedida: string | null
          upccode: string | null
          usuario: string | null
          usuarioordenservicio: string | null
          utilidad: string | null
          utilidadporcentaje: string | null
          uuid: string | null
          vehiculoano: string | null
          vehiculomarca: string | null
          vehiculomodelo: string | null
          vendedor: string | null
        }
        Insert: {
          almacen?: string | null
          ancho?: string | null
          cancelada?: boolean | null
          cantidad?: string | null
          categoria?: string | null
          clienteclave?: string | null
          clienterazon?: string | null
          comentario?: string | null
          comentarios?: string | null
          comprobante?: string | null
          costo?: string | null
          costoneto?: string | null
          costototal?: string | null
          cuentacontable?: string | null
          descripcion?: string | null
          descuento?: string | null
          empresa?: string | null
          estatus?: string | null
          fecha?: string | null
          fechamodificacion?: string | null
          folio?: string | null
          id?: number
          ieps?: string | null
          importe?: string | null
          importeieps?: string | null
          importeiva?: string | null
          importeneto?: string | null
          impuestos?: string | null
          iva?: string | null
          linea?: string | null
          listaprecio?: string | null
          marca?: string | null
          marcamodelo?: string | null
          medidallantas?: string | null
          moneda?: string | null
          noeconomico?: string | null
          odometro?: string | null
          operador?: string | null
          operadorcomision?: string | null
          placas?: string | null
          precio?: string | null
          preciocatalogo?: string | null
          productid?: string | null
          producto?: string | null
          producttype?: string | null
          proveedorclave?: string | null
          proveedorrazon?: string | null
          rango?: string | null
          referencia?: string | null
          rfc?: string | null
          rin?: string | null
          serie?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          sublinea?: string | null
          sucursal?: string | null
          tipo?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          tipoegreso?: string | null
          tipovehiculo?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
          upccode?: string | null
          usuario?: string | null
          usuarioordenservicio?: string | null
          utilidad?: string | null
          utilidadporcentaje?: string | null
          uuid?: string | null
          vehiculoano?: string | null
          vehiculomarca?: string | null
          vehiculomodelo?: string | null
          vendedor?: string | null
        }
        Update: {
          almacen?: string | null
          ancho?: string | null
          cancelada?: boolean | null
          cantidad?: string | null
          categoria?: string | null
          clienteclave?: string | null
          clienterazon?: string | null
          comentario?: string | null
          comentarios?: string | null
          comprobante?: string | null
          costo?: string | null
          costoneto?: string | null
          costototal?: string | null
          cuentacontable?: string | null
          descripcion?: string | null
          descuento?: string | null
          empresa?: string | null
          estatus?: string | null
          fecha?: string | null
          fechamodificacion?: string | null
          folio?: string | null
          id?: number
          ieps?: string | null
          importe?: string | null
          importeieps?: string | null
          importeiva?: string | null
          importeneto?: string | null
          impuestos?: string | null
          iva?: string | null
          linea?: string | null
          listaprecio?: string | null
          marca?: string | null
          marcamodelo?: string | null
          medidallantas?: string | null
          moneda?: string | null
          noeconomico?: string | null
          odometro?: string | null
          operador?: string | null
          operadorcomision?: string | null
          placas?: string | null
          precio?: string | null
          preciocatalogo?: string | null
          productid?: string | null
          producto?: string | null
          producttype?: string | null
          proveedorclave?: string | null
          proveedorrazon?: string | null
          rango?: string | null
          referencia?: string | null
          rfc?: string | null
          rin?: string | null
          serie?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          sublinea?: string | null
          sucursal?: string | null
          tipo?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          tipoegreso?: string | null
          tipovehiculo?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
          upccode?: string | null
          usuario?: string | null
          usuarioordenservicio?: string | null
          utilidad?: string | null
          utilidadporcentaje?: string | null
          uuid?: string | null
          vehiculoano?: string | null
          vehiculomarca?: string | null
          vehiculomodelo?: string | null
          vendedor?: string | null
        }
        Relationships: []
      }
      okcar_comprobantesfiscalesview: {
        Row: {
          abonos: string | null
          almacen: string | null
          anticipo: string | null
          anticipos: string | null
          antiguedad: string | null
          banco: string | null
          bancodescripcion: string | null
          cancelada: boolean | null
          cformapago: string | null
          clabe: string | null
          cliente: string | null
          cmetodopago: string | null
          comentarios: string | null
          comision: string | null
          credito: boolean | null
          ctipodecomprobante: string | null
          curp: string | null
          cusocfdi: string | null
          datosvehiculoimpresion: boolean | null
          deduccionestotalexento: string | null
          deduccionestotalgravado: string | null
          departamento: string | null
          descuentos: string | null
          diasatraso: string | null
          diaspagados: string | null
          embarquedireccion: string | null
          embarqueid: string | null
          embarquenombre: string | null
          empresa: string | null
          empresarfc: string | null
          entrega: string | null
          estatus: string | null
          facturado: boolean | null
          facturafolio: string | null
          fecha: string | null
          fechafinalpago: string | null
          fechafoliofiscalorig: string | null
          fechainicialpago: string | null
          fechainiciorellaboral: string | null
          fechamodificacion: string | null
          fechapago: string | null
          fechavencimiento: string | null
          folio: string | null
          foliofiscalorig: string | null
          foliooriginal: string | null
          formadepago: string | null
          id: number
          iepstrasladado: string | null
          impuestos: string | null
          incluyeiva: boolean | null
          ivatrasladado: string | null
          listaprecioid: string | null
          metododepago: string | null
          moneda: string | null
          montofoliofiscalorig: string | null
          nofacfolio: string | null
          numctapago: string | null
          numerofactura: string | null
          numseguridadsocial: string | null
          odometro: string | null
          percepcionestotalexento: string | null
          percepcionestotalgravado: string | null
          periodicidadpago: string | null
          puesto: string | null
          razonsocial: string | null
          referencia: string | null
          regimencontratado: string | null
          region: string | null
          retencionisr: string | null
          retencioniva: string | null
          retimpced: string | null
          rfc: string | null
          riesgopuesto: string | null
          riesgopuestodescripcion: string | null
          salariobasecotapor: string | null
          salariodiariointegrado: string | null
          saldo: string | null
          sede: string | null
          serie: string | null
          seriefoliofiscalorig: string | null
          servidororigen: string | null
          subatotal: string | null
          sucursal: string | null
          sucursalfolios: string | null
          tipocontrato: string | null
          tipodecambio: string | null
          tipodecomprobante: string | null
          tipoegreso: string | null
          tipojornada: string | null
          tiporegimencontratado: string | null
          total: string | null
          userid: string | null
          usocfdi: string | null
          usuario: string | null
          uuid: string | null
          vehiculoid: string | null
          vendedor: string | null
          vendedorcomision: string | null
          vendedorid: string | null
          version: string | null
        }
        Insert: {
          abonos?: string | null
          almacen?: string | null
          anticipo?: string | null
          anticipos?: string | null
          antiguedad?: string | null
          banco?: string | null
          bancodescripcion?: string | null
          cancelada?: boolean | null
          cformapago?: string | null
          clabe?: string | null
          cliente?: string | null
          cmetodopago?: string | null
          comentarios?: string | null
          comision?: string | null
          credito?: boolean | null
          ctipodecomprobante?: string | null
          curp?: string | null
          cusocfdi?: string | null
          datosvehiculoimpresion?: boolean | null
          deduccionestotalexento?: string | null
          deduccionestotalgravado?: string | null
          departamento?: string | null
          descuentos?: string | null
          diasatraso?: string | null
          diaspagados?: string | null
          embarquedireccion?: string | null
          embarqueid?: string | null
          embarquenombre?: string | null
          empresa?: string | null
          empresarfc?: string | null
          entrega?: string | null
          estatus?: string | null
          facturado?: boolean | null
          facturafolio?: string | null
          fecha?: string | null
          fechafinalpago?: string | null
          fechafoliofiscalorig?: string | null
          fechainicialpago?: string | null
          fechainiciorellaboral?: string | null
          fechamodificacion?: string | null
          fechapago?: string | null
          fechavencimiento?: string | null
          folio?: string | null
          foliofiscalorig?: string | null
          foliooriginal?: string | null
          formadepago?: string | null
          id?: number
          iepstrasladado?: string | null
          impuestos?: string | null
          incluyeiva?: boolean | null
          ivatrasladado?: string | null
          listaprecioid?: string | null
          metododepago?: string | null
          moneda?: string | null
          montofoliofiscalorig?: string | null
          nofacfolio?: string | null
          numctapago?: string | null
          numerofactura?: string | null
          numseguridadsocial?: string | null
          odometro?: string | null
          percepcionestotalexento?: string | null
          percepcionestotalgravado?: string | null
          periodicidadpago?: string | null
          puesto?: string | null
          razonsocial?: string | null
          referencia?: string | null
          regimencontratado?: string | null
          region?: string | null
          retencionisr?: string | null
          retencioniva?: string | null
          retimpced?: string | null
          rfc?: string | null
          riesgopuesto?: string | null
          riesgopuestodescripcion?: string | null
          salariobasecotapor?: string | null
          salariodiariointegrado?: string | null
          saldo?: string | null
          sede?: string | null
          serie?: string | null
          seriefoliofiscalorig?: string | null
          servidororigen?: string | null
          subatotal?: string | null
          sucursal?: string | null
          sucursalfolios?: string | null
          tipocontrato?: string | null
          tipodecambio?: string | null
          tipodecomprobante?: string | null
          tipoegreso?: string | null
          tipojornada?: string | null
          tiporegimencontratado?: string | null
          total?: string | null
          userid?: string | null
          usocfdi?: string | null
          usuario?: string | null
          uuid?: string | null
          vehiculoid?: string | null
          vendedor?: string | null
          vendedorcomision?: string | null
          vendedorid?: string | null
          version?: string | null
        }
        Update: {
          abonos?: string | null
          almacen?: string | null
          anticipo?: string | null
          anticipos?: string | null
          antiguedad?: string | null
          banco?: string | null
          bancodescripcion?: string | null
          cancelada?: boolean | null
          cformapago?: string | null
          clabe?: string | null
          cliente?: string | null
          cmetodopago?: string | null
          comentarios?: string | null
          comision?: string | null
          credito?: boolean | null
          ctipodecomprobante?: string | null
          curp?: string | null
          cusocfdi?: string | null
          datosvehiculoimpresion?: boolean | null
          deduccionestotalexento?: string | null
          deduccionestotalgravado?: string | null
          departamento?: string | null
          descuentos?: string | null
          diasatraso?: string | null
          diaspagados?: string | null
          embarquedireccion?: string | null
          embarqueid?: string | null
          embarquenombre?: string | null
          empresa?: string | null
          empresarfc?: string | null
          entrega?: string | null
          estatus?: string | null
          facturado?: boolean | null
          facturafolio?: string | null
          fecha?: string | null
          fechafinalpago?: string | null
          fechafoliofiscalorig?: string | null
          fechainicialpago?: string | null
          fechainiciorellaboral?: string | null
          fechamodificacion?: string | null
          fechapago?: string | null
          fechavencimiento?: string | null
          folio?: string | null
          foliofiscalorig?: string | null
          foliooriginal?: string | null
          formadepago?: string | null
          id?: number
          iepstrasladado?: string | null
          impuestos?: string | null
          incluyeiva?: boolean | null
          ivatrasladado?: string | null
          listaprecioid?: string | null
          metododepago?: string | null
          moneda?: string | null
          montofoliofiscalorig?: string | null
          nofacfolio?: string | null
          numctapago?: string | null
          numerofactura?: string | null
          numseguridadsocial?: string | null
          odometro?: string | null
          percepcionestotalexento?: string | null
          percepcionestotalgravado?: string | null
          periodicidadpago?: string | null
          puesto?: string | null
          razonsocial?: string | null
          referencia?: string | null
          regimencontratado?: string | null
          region?: string | null
          retencionisr?: string | null
          retencioniva?: string | null
          retimpced?: string | null
          rfc?: string | null
          riesgopuesto?: string | null
          riesgopuestodescripcion?: string | null
          salariobasecotapor?: string | null
          salariodiariointegrado?: string | null
          saldo?: string | null
          sede?: string | null
          serie?: string | null
          seriefoliofiscalorig?: string | null
          servidororigen?: string | null
          subatotal?: string | null
          sucursal?: string | null
          sucursalfolios?: string | null
          tipocontrato?: string | null
          tipodecambio?: string | null
          tipodecomprobante?: string | null
          tipoegreso?: string | null
          tipojornada?: string | null
          tiporegimencontratado?: string | null
          total?: string | null
          userid?: string | null
          usocfdi?: string | null
          usuario?: string | null
          uuid?: string | null
          vehiculoid?: string | null
          vendedor?: string | null
          vendedorcomision?: string | null
          vendedorid?: string | null
          version?: string | null
        }
        Relationships: []
      }
      okcar_estadoscuentaresumen: {
        Row: {
          clave: string | null
          id: number
          limitedecredito: string | null
          novencido: string | null
          razonsocial: string | null
          saldototal: string | null
          servidororigen: string | null
          vencido_11a30: string | null
          vencido_1a10: string | null
          vencido_31a60: string | null
          vencido_61a90: string | null
          vencido_91a120: string | null
          vencido_masde120: string | null
        }
        Insert: {
          clave?: string | null
          id?: number
          limitedecredito?: string | null
          novencido?: string | null
          razonsocial?: string | null
          saldototal?: string | null
          servidororigen?: string | null
          vencido_11a30?: string | null
          vencido_1a10?: string | null
          vencido_31a60?: string | null
          vencido_61a90?: string | null
          vencido_91a120?: string | null
          vencido_masde120?: string | null
        }
        Update: {
          clave?: string | null
          id?: number
          limitedecredito?: string | null
          novencido?: string | null
          razonsocial?: string | null
          saldototal?: string | null
          servidororigen?: string | null
          vencido_11a30?: string | null
          vencido_1a10?: string | null
          vencido_31a60?: string | null
          vencido_61a90?: string | null
          vencido_91a120?: string | null
          vencido_masde120?: string | null
        }
        Relationships: []
      }
      okcar_ingresosview: {
        Row: {
          abono: string | null
          cancelado: boolean | null
          cargo: string | null
          clabe: string | null
          clave: string | null
          complementopago: string | null
          comprobante: string | null
          comprobantenotacredito: string | null
          concepto: string | null
          diasatraso: string | null
          diascredito: string | null
          documento: string | null
          fecha: string | null
          fechacomprobante: string | null
          fechamodificacion: string | null
          fechapago: string | null
          folio: string | null
          foliofactura: string | null
          formapago: string | null
          id: number
          ingreso_id: string | null
          moneda: string | null
          noeconomico: string | null
          placas: string | null
          razonsocial: string | null
          referencia: string | null
          rfc: string | null
          saldo: string | null
          seriefactura: string | null
          servidororigen: string | null
          sucursal: string | null
          tipocambio: string | null
          tipocomprobante: string | null
          tipovehiculo: string | null
          usuario: string | null
          uuid: string | null
          vehiculoano: string | null
          vehiculomarca: string | null
          vehiculomodelo: string | null
        }
        Insert: {
          abono?: string | null
          cancelado?: boolean | null
          cargo?: string | null
          clabe?: string | null
          clave?: string | null
          complementopago?: string | null
          comprobante?: string | null
          comprobantenotacredito?: string | null
          concepto?: string | null
          diasatraso?: string | null
          diascredito?: string | null
          documento?: string | null
          fecha?: string | null
          fechacomprobante?: string | null
          fechamodificacion?: string | null
          fechapago?: string | null
          folio?: string | null
          foliofactura?: string | null
          formapago?: string | null
          id?: number
          ingreso_id?: string | null
          moneda?: string | null
          noeconomico?: string | null
          placas?: string | null
          razonsocial?: string | null
          referencia?: string | null
          rfc?: string | null
          saldo?: string | null
          seriefactura?: string | null
          servidororigen?: string | null
          sucursal?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          tipovehiculo?: string | null
          usuario?: string | null
          uuid?: string | null
          vehiculoano?: string | null
          vehiculomarca?: string | null
          vehiculomodelo?: string | null
        }
        Update: {
          abono?: string | null
          cancelado?: boolean | null
          cargo?: string | null
          clabe?: string | null
          clave?: string | null
          complementopago?: string | null
          comprobante?: string | null
          comprobantenotacredito?: string | null
          concepto?: string | null
          diasatraso?: string | null
          diascredito?: string | null
          documento?: string | null
          fecha?: string | null
          fechacomprobante?: string | null
          fechamodificacion?: string | null
          fechapago?: string | null
          folio?: string | null
          foliofactura?: string | null
          formapago?: string | null
          id?: number
          ingreso_id?: string | null
          moneda?: string | null
          noeconomico?: string | null
          placas?: string | null
          razonsocial?: string | null
          referencia?: string | null
          rfc?: string | null
          saldo?: string | null
          seriefactura?: string | null
          servidororigen?: string | null
          sucursal?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          tipovehiculo?: string | null
          usuario?: string | null
          uuid?: string | null
          vehiculoano?: string | null
          vehiculomarca?: string | null
          vehiculomodelo?: string | null
        }
        Relationships: []
      }
      okcar_inventarioview: {
        Row: {
          almacen: string | null
          categoria: string | null
          costoestandar: string | null
          costopromedio: string | null
          descripcion: string | null
          diassincompra: string | null
          diassinventa: string | null
          disponible: string | null
          entrada: string | null
          existencia: string | null
          fechaultimacompra: string | null
          fechaultimaventa: string | null
          id: number
          inactivo: boolean | null
          linea: string | null
          marca: string | null
          modelo: string | null
          ordenporsurtir: string | null
          porsurtir: string | null
          productid: string | null
          producto: string | null
          rango: string | null
          salida: string | null
          servidororigen: string | null
          stockmax: string | null
          stockmin: string | null
          stockreorden: string | null
          subcategoria1: string | null
          sublinea: string | null
          tipo: string | null
          ultimocosto: string | null
          umb: string | null
          upccode: string | null
          valorstock: string | null
        }
        Insert: {
          almacen?: string | null
          categoria?: string | null
          costoestandar?: string | null
          costopromedio?: string | null
          descripcion?: string | null
          diassincompra?: string | null
          diassinventa?: string | null
          disponible?: string | null
          entrada?: string | null
          existencia?: string | null
          fechaultimacompra?: string | null
          fechaultimaventa?: string | null
          id?: number
          inactivo?: boolean | null
          linea?: string | null
          marca?: string | null
          modelo?: string | null
          ordenporsurtir?: string | null
          porsurtir?: string | null
          productid?: string | null
          producto?: string | null
          rango?: string | null
          salida?: string | null
          servidororigen?: string | null
          stockmax?: string | null
          stockmin?: string | null
          stockreorden?: string | null
          subcategoria1?: string | null
          sublinea?: string | null
          tipo?: string | null
          ultimocosto?: string | null
          umb?: string | null
          upccode?: string | null
          valorstock?: string | null
        }
        Update: {
          almacen?: string | null
          categoria?: string | null
          costoestandar?: string | null
          costopromedio?: string | null
          descripcion?: string | null
          diassincompra?: string | null
          diassinventa?: string | null
          disponible?: string | null
          entrada?: string | null
          existencia?: string | null
          fechaultimacompra?: string | null
          fechaultimaventa?: string | null
          id?: number
          inactivo?: boolean | null
          linea?: string | null
          marca?: string | null
          modelo?: string | null
          ordenporsurtir?: string | null
          porsurtir?: string | null
          productid?: string | null
          producto?: string | null
          rango?: string | null
          salida?: string | null
          servidororigen?: string | null
          stockmax?: string | null
          stockmin?: string | null
          stockreorden?: string | null
          subcategoria1?: string | null
          sublinea?: string | null
          tipo?: string | null
          ultimocosto?: string | null
          umb?: string | null
          upccode?: string | null
          valorstock?: string | null
        }
        Relationships: []
      }
      okcar_operacionesinventario: {
        Row: {
          almacen: string | null
          almacendestino: string | null
          almacendestinoid: string | null
          autorizacionusuario: string | null
          autorizada: boolean | null
          cancelada: boolean | null
          comentario: string | null
          concepto: string | null
          fecha: string | null
          fechamodificacion: string | null
          folio: string | null
          foliooperacion: string | null
          id: number
          referencia: string | null
          servidororigen: string | null
          usuario: string | null
          usuarioid: string | null
        }
        Insert: {
          almacen?: string | null
          almacendestino?: string | null
          almacendestinoid?: string | null
          autorizacionusuario?: string | null
          autorizada?: boolean | null
          cancelada?: boolean | null
          comentario?: string | null
          concepto?: string | null
          fecha?: string | null
          fechamodificacion?: string | null
          folio?: string | null
          foliooperacion?: string | null
          id?: number
          referencia?: string | null
          servidororigen?: string | null
          usuario?: string | null
          usuarioid?: string | null
        }
        Update: {
          almacen?: string | null
          almacendestino?: string | null
          almacendestinoid?: string | null
          autorizacionusuario?: string | null
          autorizada?: boolean | null
          cancelada?: boolean | null
          comentario?: string | null
          concepto?: string | null
          fecha?: string | null
          fechamodificacion?: string | null
          folio?: string | null
          foliooperacion?: string | null
          id?: number
          referencia?: string | null
          servidororigen?: string | null
          usuario?: string | null
          usuarioid?: string | null
        }
        Relationships: []
      }
      okcar_ordenesconceptos: {
        Row: {
          almacen: string | null
          ancho: string | null
          cantidad: string | null
          categoria: string | null
          comentario: string | null
          comentarios: string | null
          contacto: string | null
          costounitario: string | null
          cuentacontable: string | null
          descripcion: string | null
          descuento: string | null
          email: string | null
          empresa: string | null
          estado: string | null
          estatus: string | null
          fecha: string | null
          folio: string | null
          id: number
          importeneto: string | null
          impuestos: string | null
          inventario: boolean | null
          linea: string | null
          marca: string | null
          marcamodelo: string | null
          moneda: string | null
          orden_id: string | null
          precioneto: string | null
          preciounitario: string | null
          productid: string | null
          producto: string | null
          proveedorcategoria: string | null
          proveedorclave: string | null
          proveedorrazon: string | null
          rango: string | null
          referencia: string | null
          rfc: string | null
          rin: string | null
          serie: string | null
          servidororigen: string | null
          subcategoria1: string | null
          sublinea: string | null
          sucursal: string | null
          telefono: string | null
          tipo: string | null
          tipocambio: string | null
          unidadmedida: string | null
          upccode: string | null
          usuario: string | null
          uuid: string | null
        }
        Insert: {
          almacen?: string | null
          ancho?: string | null
          cantidad?: string | null
          categoria?: string | null
          comentario?: string | null
          comentarios?: string | null
          contacto?: string | null
          costounitario?: string | null
          cuentacontable?: string | null
          descripcion?: string | null
          descuento?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          estatus?: string | null
          fecha?: string | null
          folio?: string | null
          id?: number
          importeneto?: string | null
          impuestos?: string | null
          inventario?: boolean | null
          linea?: string | null
          marca?: string | null
          marcamodelo?: string | null
          moneda?: string | null
          orden_id?: string | null
          precioneto?: string | null
          preciounitario?: string | null
          productid?: string | null
          producto?: string | null
          proveedorcategoria?: string | null
          proveedorclave?: string | null
          proveedorrazon?: string | null
          rango?: string | null
          referencia?: string | null
          rfc?: string | null
          rin?: string | null
          serie?: string | null
          servidororigen?: string | null
          subcategoria1?: string | null
          sublinea?: string | null
          sucursal?: string | null
          telefono?: string | null
          tipo?: string | null
          tipocambio?: string | null
          unidadmedida?: string | null
          upccode?: string | null
          usuario?: string | null
          uuid?: string | null
        }
        Update: {
          almacen?: string | null
          ancho?: string | null
          cantidad?: string | null
          categoria?: string | null
          comentario?: string | null
          comentarios?: string | null
          contacto?: string | null
          costounitario?: string | null
          cuentacontable?: string | null
          descripcion?: string | null
          descuento?: string | null
          email?: string | null
          empresa?: string | null
          estado?: string | null
          estatus?: string | null
          fecha?: string | null
          folio?: string | null
          id?: number
          importeneto?: string | null
          impuestos?: string | null
          inventario?: boolean | null
          linea?: string | null
          marca?: string | null
          marcamodelo?: string | null
          moneda?: string | null
          orden_id?: string | null
          precioneto?: string | null
          preciounitario?: string | null
          productid?: string | null
          producto?: string | null
          proveedorcategoria?: string | null
          proveedorclave?: string | null
          proveedorrazon?: string | null
          rango?: string | null
          referencia?: string | null
          rfc?: string | null
          rin?: string | null
          serie?: string | null
          servidororigen?: string | null
          subcategoria1?: string | null
          sublinea?: string | null
          sucursal?: string | null
          telefono?: string | null
          tipo?: string | null
          tipocambio?: string | null
          unidadmedida?: string | null
          upccode?: string | null
          usuario?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      okcar_ventas: {
        Row: {
          almacen: string | null
          ancho: string | null
          cancelada: boolean | null
          cantidad: string | null
          categoria: string | null
          clienteclave: string | null
          clienterazon: string | null
          comentario: string | null
          comentarios: string | null
          comprobante: string | null
          costo: string | null
          costoneto: string | null
          costototal: string | null
          cuentacontable: string | null
          descripcion: string | null
          descuento: string | null
          empresa: string | null
          estatus: string | null
          fecha: string | null
          fechaalta: string | null
          fechamodificacion: string | null
          folio: string | null
          id: number
          ieps: string | null
          importe: string | null
          importeieps: string | null
          importeiva: string | null
          importeneto: string | null
          impuestos: string | null
          iva: string | null
          linea: string | null
          listaprecio: string | null
          marca: string | null
          marcamodelo: string | null
          medidallantas: string | null
          moneda: string | null
          noeconomico: string | null
          odometro: string | null
          operador: string | null
          operadorcomision: string | null
          placas: string | null
          precio: string | null
          preciocatalogo: string | null
          productid: string | null
          producto: string | null
          producttype: string | null
          proveedorclave: string | null
          proveedorrazon: string | null
          rango: string | null
          referencia: string | null
          rfc: string | null
          rin: string | null
          serie: string | null
          servidororigen: string | null
          subcategoria: string | null
          sublinea: string | null
          sucursal: string | null
          tipo: string | null
          tipocambio: string | null
          tipocomprobante: string | null
          tipoegreso: string | null
          tipovehiculo: string | null
          ultimocosto: string | null
          unidadmedida: string | null
          upccode: string | null
          usuario: string | null
          usuarioordenservicio: string | null
          utilidad: string | null
          utilidadporcentaje: string | null
          uuid: string | null
          vehiculoano: string | null
          vehiculomarca: string | null
          vehiculomodelo: string | null
          vendedor: string | null
        }
        Insert: {
          almacen?: string | null
          ancho?: string | null
          cancelada?: boolean | null
          cantidad?: string | null
          categoria?: string | null
          clienteclave?: string | null
          clienterazon?: string | null
          comentario?: string | null
          comentarios?: string | null
          comprobante?: string | null
          costo?: string | null
          costoneto?: string | null
          costototal?: string | null
          cuentacontable?: string | null
          descripcion?: string | null
          descuento?: string | null
          empresa?: string | null
          estatus?: string | null
          fecha?: string | null
          fechaalta?: string | null
          fechamodificacion?: string | null
          folio?: string | null
          id?: number
          ieps?: string | null
          importe?: string | null
          importeieps?: string | null
          importeiva?: string | null
          importeneto?: string | null
          impuestos?: string | null
          iva?: string | null
          linea?: string | null
          listaprecio?: string | null
          marca?: string | null
          marcamodelo?: string | null
          medidallantas?: string | null
          moneda?: string | null
          noeconomico?: string | null
          odometro?: string | null
          operador?: string | null
          operadorcomision?: string | null
          placas?: string | null
          precio?: string | null
          preciocatalogo?: string | null
          productid?: string | null
          producto?: string | null
          producttype?: string | null
          proveedorclave?: string | null
          proveedorrazon?: string | null
          rango?: string | null
          referencia?: string | null
          rfc?: string | null
          rin?: string | null
          serie?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          sublinea?: string | null
          sucursal?: string | null
          tipo?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          tipoegreso?: string | null
          tipovehiculo?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
          upccode?: string | null
          usuario?: string | null
          usuarioordenservicio?: string | null
          utilidad?: string | null
          utilidadporcentaje?: string | null
          uuid?: string | null
          vehiculoano?: string | null
          vehiculomarca?: string | null
          vehiculomodelo?: string | null
          vendedor?: string | null
        }
        Update: {
          almacen?: string | null
          ancho?: string | null
          cancelada?: boolean | null
          cantidad?: string | null
          categoria?: string | null
          clienteclave?: string | null
          clienterazon?: string | null
          comentario?: string | null
          comentarios?: string | null
          comprobante?: string | null
          costo?: string | null
          costoneto?: string | null
          costototal?: string | null
          cuentacontable?: string | null
          descripcion?: string | null
          descuento?: string | null
          empresa?: string | null
          estatus?: string | null
          fecha?: string | null
          fechaalta?: string | null
          fechamodificacion?: string | null
          folio?: string | null
          id?: number
          ieps?: string | null
          importe?: string | null
          importeieps?: string | null
          importeiva?: string | null
          importeneto?: string | null
          impuestos?: string | null
          iva?: string | null
          linea?: string | null
          listaprecio?: string | null
          marca?: string | null
          marcamodelo?: string | null
          medidallantas?: string | null
          moneda?: string | null
          noeconomico?: string | null
          odometro?: string | null
          operador?: string | null
          operadorcomision?: string | null
          placas?: string | null
          precio?: string | null
          preciocatalogo?: string | null
          productid?: string | null
          producto?: string | null
          producttype?: string | null
          proveedorclave?: string | null
          proveedorrazon?: string | null
          rango?: string | null
          referencia?: string | null
          rfc?: string | null
          rin?: string | null
          serie?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          sublinea?: string | null
          sucursal?: string | null
          tipo?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          tipoegreso?: string | null
          tipovehiculo?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
          upccode?: string | null
          usuario?: string | null
          usuarioordenservicio?: string | null
          utilidad?: string | null
          utilidadporcentaje?: string | null
          uuid?: string | null
          vehiculoano?: string | null
          vehiculomarca?: string | null
          vehiculomodelo?: string | null
          vendedor?: string | null
        }
        Relationships: []
      }
      okcar_ventas_v2: {
        Row: {
          almacen: string | null
          ancho: string | null
          cancelada: boolean | null
          cantidad: string | null
          categoria: string | null
          clienteclave: string | null
          clienteclaveformateada: string | null
          clienterazon: string | null
          comentario: string | null
          comentarios: string | null
          comprobante: string | null
          costo: string | null
          costoneto: string | null
          costototal: string | null
          cuentacontable: string | null
          date: string | null
          descripcion: string | null
          descuento: string | null
          empresa: string | null
          estatus: string | null
          fecha: string | null
          fechaalta: string | null
          fechamodificacion: string | null
          folio: string | null
          folioformateado: string | null
          id: number
          idproductounico: string | null
          ieps: string | null
          importe: string | null
          importeieps: string | null
          importeiva: string | null
          importeneto: string | null
          impuestos: string | null
          iva: string | null
          linea: string | null
          listaprecio: string | null
          marca: string | null
          marcamodelo: string | null
          medidallantas: string | null
          moneda: string | null
          noeconomico: string | null
          odometro: string | null
          operador: string | null
          operadorcomision: string | null
          placas: string | null
          precio: string | null
          preciocatalogo: string | null
          productid: string | null
          producto: string | null
          productolimpio: string | null
          producttype: string | null
          proveedorclave: string | null
          proveedorrazon: string | null
          rango: string | null
          referencia: string | null
          rfc: string | null
          rin: string | null
          serie: string | null
          servidororigen: string | null
          subcategoria: string | null
          sublinea: string | null
          sucursal: string | null
          tipo: string | null
          tipocambio: string | null
          tipocomprobante: string | null
          tipoegreso: string | null
          tipovehiculo: string | null
          ultimocosto: string | null
          unidadmedida: string | null
          upccode: string | null
          usuario: string | null
          usuarioordenservicio: string | null
          utilidad: string | null
          utilidadporcentaje: string | null
          uuid: string | null
          vehiculoano: string | null
          vehiculomarca: string | null
          vehiculomodelo: string | null
          vendedor: string | null
        }
        Insert: {
          almacen?: string | null
          ancho?: string | null
          cancelada?: boolean | null
          cantidad?: string | null
          categoria?: string | null
          clienteclave?: string | null
          clienteclaveformateada?: string | null
          clienterazon?: string | null
          comentario?: string | null
          comentarios?: string | null
          comprobante?: string | null
          costo?: string | null
          costoneto?: string | null
          costototal?: string | null
          cuentacontable?: string | null
          date?: string | null
          descripcion?: string | null
          descuento?: string | null
          empresa?: string | null
          estatus?: string | null
          fecha?: string | null
          fechaalta?: string | null
          fechamodificacion?: string | null
          folio?: string | null
          folioformateado?: string | null
          id?: number
          idproductounico?: string | null
          ieps?: string | null
          importe?: string | null
          importeieps?: string | null
          importeiva?: string | null
          importeneto?: string | null
          impuestos?: string | null
          iva?: string | null
          linea?: string | null
          listaprecio?: string | null
          marca?: string | null
          marcamodelo?: string | null
          medidallantas?: string | null
          moneda?: string | null
          noeconomico?: string | null
          odometro?: string | null
          operador?: string | null
          operadorcomision?: string | null
          placas?: string | null
          precio?: string | null
          preciocatalogo?: string | null
          productid?: string | null
          producto?: string | null
          productolimpio?: string | null
          producttype?: string | null
          proveedorclave?: string | null
          proveedorrazon?: string | null
          rango?: string | null
          referencia?: string | null
          rfc?: string | null
          rin?: string | null
          serie?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          sublinea?: string | null
          sucursal?: string | null
          tipo?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          tipoegreso?: string | null
          tipovehiculo?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
          upccode?: string | null
          usuario?: string | null
          usuarioordenservicio?: string | null
          utilidad?: string | null
          utilidadporcentaje?: string | null
          uuid?: string | null
          vehiculoano?: string | null
          vehiculomarca?: string | null
          vehiculomodelo?: string | null
          vendedor?: string | null
        }
        Update: {
          almacen?: string | null
          ancho?: string | null
          cancelada?: boolean | null
          cantidad?: string | null
          categoria?: string | null
          clienteclave?: string | null
          clienteclaveformateada?: string | null
          clienterazon?: string | null
          comentario?: string | null
          comentarios?: string | null
          comprobante?: string | null
          costo?: string | null
          costoneto?: string | null
          costototal?: string | null
          cuentacontable?: string | null
          date?: string | null
          descripcion?: string | null
          descuento?: string | null
          empresa?: string | null
          estatus?: string | null
          fecha?: string | null
          fechaalta?: string | null
          fechamodificacion?: string | null
          folio?: string | null
          folioformateado?: string | null
          id?: number
          idproductounico?: string | null
          ieps?: string | null
          importe?: string | null
          importeieps?: string | null
          importeiva?: string | null
          importeneto?: string | null
          impuestos?: string | null
          iva?: string | null
          linea?: string | null
          listaprecio?: string | null
          marca?: string | null
          marcamodelo?: string | null
          medidallantas?: string | null
          moneda?: string | null
          noeconomico?: string | null
          odometro?: string | null
          operador?: string | null
          operadorcomision?: string | null
          placas?: string | null
          precio?: string | null
          preciocatalogo?: string | null
          productid?: string | null
          producto?: string | null
          productolimpio?: string | null
          producttype?: string | null
          proveedorclave?: string | null
          proveedorrazon?: string | null
          rango?: string | null
          referencia?: string | null
          rfc?: string | null
          rin?: string | null
          serie?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          sublinea?: string | null
          sucursal?: string | null
          tipo?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          tipoegreso?: string | null
          tipovehiculo?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
          upccode?: string | null
          usuario?: string | null
          usuarioordenservicio?: string | null
          utilidad?: string | null
          utilidadporcentaje?: string | null
          uuid?: string | null
          vehiculoano?: string | null
          vehiculomarca?: string | null
          vehiculomodelo?: string | null
          vendedor?: string | null
        }
        Relationships: []
      }
      okcar_view_cxc: {
        Row: {
          abono: string | null
          cancelado: boolean | null
          cargo: string | null
          clave: string | null
          complementopago: string | null
          comprobante: string | null
          comprobantenotacredito: string | null
          concepto: string | null
          credito: boolean | null
          cxc: string | null
          diasatraso: string | null
          documento: string | null
          fecha: string | null
          fechacomprobante: string | null
          fechamodificacion: string | null
          fechapago: string | null
          folio: string | null
          formapago: string | null
          id: number
          metodopago: string | null
          moneda: string | null
          os: string | null
          razonsocial: string | null
          referencia: string | null
          rfc: string | null
          saldo: string | null
          servidororigen: string | null
          sucursal: string | null
          tipocambio: string | null
          tipocomprobante: string | null
          usuario: string | null
          vendedor: string | null
          version: string | null
        }
        Insert: {
          abono?: string | null
          cancelado?: boolean | null
          cargo?: string | null
          clave?: string | null
          complementopago?: string | null
          comprobante?: string | null
          comprobantenotacredito?: string | null
          concepto?: string | null
          credito?: boolean | null
          cxc?: string | null
          diasatraso?: string | null
          documento?: string | null
          fecha?: string | null
          fechacomprobante?: string | null
          fechamodificacion?: string | null
          fechapago?: string | null
          folio?: string | null
          formapago?: string | null
          id?: number
          metodopago?: string | null
          moneda?: string | null
          os?: string | null
          razonsocial?: string | null
          referencia?: string | null
          rfc?: string | null
          saldo?: string | null
          servidororigen?: string | null
          sucursal?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          usuario?: string | null
          vendedor?: string | null
          version?: string | null
        }
        Update: {
          abono?: string | null
          cancelado?: boolean | null
          cargo?: string | null
          clave?: string | null
          complementopago?: string | null
          comprobante?: string | null
          comprobantenotacredito?: string | null
          concepto?: string | null
          credito?: boolean | null
          cxc?: string | null
          diasatraso?: string | null
          documento?: string | null
          fecha?: string | null
          fechacomprobante?: string | null
          fechamodificacion?: string | null
          fechapago?: string | null
          folio?: string | null
          formapago?: string | null
          id?: number
          metodopago?: string | null
          moneda?: string | null
          os?: string | null
          razonsocial?: string | null
          referencia?: string | null
          rfc?: string | null
          saldo?: string | null
          servidororigen?: string | null
          sucursal?: string | null
          tipocambio?: string | null
          tipocomprobante?: string | null
          usuario?: string | null
          vendedor?: string | null
          version?: string | null
        }
        Relationships: []
      }
      okcar_view_kardex: {
        Row: {
          almacen: string | null
          almacendestino: string | null
          categoria: string | null
          comprobante: string | null
          concepto: string | null
          costo: string | null
          descripcion: string | null
          entrada: string | null
          existencia: string | null
          existenciatotal: string | null
          fecha: string | null
          folio: string | null
          foliooperacion: string | null
          id: number
          linea: string | null
          marca: string | null
          modelo: string | null
          precio: string | null
          producto: string | null
          rango: string | null
          referencia: string | null
          salida: string | null
          servidororigen: string | null
          subcategoria: string | null
          sublinea: string | null
          tipo: string | null
          ultimocosto: string | null
          unidadmedida: string | null
        }
        Insert: {
          almacen?: string | null
          almacendestino?: string | null
          categoria?: string | null
          comprobante?: string | null
          concepto?: string | null
          costo?: string | null
          descripcion?: string | null
          entrada?: string | null
          existencia?: string | null
          existenciatotal?: string | null
          fecha?: string | null
          folio?: string | null
          foliooperacion?: string | null
          id?: number
          linea?: string | null
          marca?: string | null
          modelo?: string | null
          precio?: string | null
          producto?: string | null
          rango?: string | null
          referencia?: string | null
          salida?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          sublinea?: string | null
          tipo?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
        }
        Update: {
          almacen?: string | null
          almacendestino?: string | null
          categoria?: string | null
          comprobante?: string | null
          concepto?: string | null
          costo?: string | null
          descripcion?: string | null
          entrada?: string | null
          existencia?: string | null
          existenciatotal?: string | null
          fecha?: string | null
          folio?: string | null
          foliooperacion?: string | null
          id?: number
          linea?: string | null
          marca?: string | null
          modelo?: string | null
          precio?: string | null
          producto?: string | null
          rango?: string | null
          referencia?: string | null
          salida?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          sublinea?: string | null
          tipo?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
        }
        Relationships: []
      }
      okcar_view_listaprecios: {
        Row: {
          categoria: string | null
          costoestandar: string | null
          costopromedio: string | null
          descripcion: string | null
          id: number
          listadeprecios: string | null
          marca: string | null
          precio: string | null
          preciodefault: string | null
          productid: string | null
          producto: string | null
          servidororigen: string | null
          subcategoria: string | null
          ultimocosto: string | null
          unidadmedida: string | null
        }
        Insert: {
          categoria?: string | null
          costoestandar?: string | null
          costopromedio?: string | null
          descripcion?: string | null
          id?: number
          listadeprecios?: string | null
          marca?: string | null
          precio?: string | null
          preciodefault?: string | null
          productid?: string | null
          producto?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
        }
        Update: {
          categoria?: string | null
          costoestandar?: string | null
          costopromedio?: string | null
          descripcion?: string | null
          id?: number
          listadeprecios?: string | null
          marca?: string | null
          precio?: string | null
          preciodefault?: string | null
          productid?: string | null
          producto?: string | null
          servidororigen?: string | null
          subcategoria?: string | null
          ultimocosto?: string | null
          unidadmedida?: string | null
        }
        Relationships: []
      }
      platform_modules: {
        Row: {
          id: string
          is_active: boolean | null
          key: string
          label: string
          module: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          key: string
          label: string
          module: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          is_active?: boolean | null
          key?: string
          label?: string
          module?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          last_seen: string | null
          phone: string | null
          role: string
          role_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          last_seen?: string | null
          phone?: string | null
          role?: string
          role_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_seen?: string | null
          phone?: string | null
          role?: string
          role_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      resp_answers: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          not_applicable: boolean
          option_id: string | null
          question_id: string
          run_id: string
          value_bool: boolean | null
          value_date: string | null
          value_json: Json | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          not_applicable?: boolean
          option_id?: string | null
          question_id: string
          run_id: string
          value_bool?: boolean | null
          value_date?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          not_applicable?: boolean
          option_id?: string | null
          question_id?: string
          run_id?: string
          value_bool?: boolean | null
          value_date?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resp_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "form_question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resp_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "form_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resp_answers_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "resp_survey_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      resp_survey_runs: {
        Row: {
          assignment_id: string | null
          audited_user_id: string | null
          branch_id: string | null
          completed_at: string | null
          context: Json | null
          created_at: string
          device_info: string | null
          id: string
          respondent_id: string
          started_at: string
          status: string
          survey_id: string
        }
        Insert: {
          assignment_id?: string | null
          audited_user_id?: string | null
          branch_id?: string | null
          completed_at?: string | null
          context?: Json | null
          created_at?: string
          device_info?: string | null
          id?: string
          respondent_id: string
          started_at?: string
          status?: string
          survey_id: string
        }
        Update: {
          assignment_id?: string | null
          audited_user_id?: string | null
          branch_id?: string | null
          completed_at?: string | null
          context?: Json | null
          created_at?: string
          device_info?: string | null
          id?: string
          respondent_id?: string
          started_at?: string
          status?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resp_survey_runs_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "form_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resp_survey_runs_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "form_surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      role_change_log: {
        Row: {
          changed_at: string | null
          changed_by: string
          id: string
          new_role_id: string | null
          old_role_id: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string | null
          changed_by: string
          id?: string
          new_role_id?: string | null
          old_role_id?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string | null
          changed_by?: string
          id?: string
          new_role_id?: string | null
          old_role_id?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_change_log_new_role_id_fkey"
            columns: ["new_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_change_log_old_role_id_fkey"
            columns: ["old_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          module_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          module_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          module_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "platform_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          is_root: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_root?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_root?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          operation: string
          record_id: string | null
          status: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          operation: string
          record_id?: string | null
          status: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          operation?: string
          record_id?: string | null
          status?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          is_read: boolean | null
          message: string
          severity: string
          target_role_id: string | null
          target_user: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_read?: boolean | null
          message: string
          severity?: string
          target_role_id?: string | null
          target_user?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: string
          target_role_id?: string | null
          target_user?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_alerts_target_role_id_fkey"
            columns: ["target_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_alerts_target_user_fkey"
            columns: ["target_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_warehouses: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          warehouse_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          warehouse_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          warehouse_name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          role: string
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: string
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_branch: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      current_user_role_id: { Args: never; Returns: string }
      get_inventory_creators: {
        Args: never
        Returns: {
          id: string
          name: string
        }[]
      }
      get_unique_warehouses: {
        Args: never
        Returns: {
          Almacen: string
        }[]
      }
      get_user_name: { Args: { user_uuid: string }; Returns: string }
      has_permission: { Args: { permission_key: string }; Returns: boolean }
      is_root: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
