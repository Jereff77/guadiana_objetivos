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
      profiles: {
        Row: {
          branch_id: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
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
