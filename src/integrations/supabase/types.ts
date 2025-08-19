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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string | null
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          application_id?: string | null
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          application_id?: string | null
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_history: {
        Row: {
          application_id: string | null
          changed_at: string | null
          changed_by: string | null
          id: string
          new_status: string | null
          notes: string | null
          previous_status: string | null
        }
        Insert: {
          application_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
        }
        Update: {
          application_id?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          availability_start: string | null
          candidate_id: string | null
          reference_contacts: string | null
          cover_letter: string | null
          created_at: string | null
          id: string
          job_offer_id: string | null
          motivation: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          availability_start?: string | null
          candidate_id?: string | null
          reference_contacts?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_offer_id?: string | null
          motivation?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_start?: string | null
          candidate_id?: string | null
          reference_contacts?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          job_offer_id?: string | null
          motivation?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_offer_id_fkey"
            columns: ["job_offer_id"]
            isOneToOne: false
            referencedRelation: "job_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          availability: string | null
          created_at: string | null
          current_department: string | null
          current_position: string | null
          cv_url: string | null
          education: string | null
          expected_salary_max: number | null
          expected_salary_min: number | null
          id: string
          skills: string[] | null
          updated_at: string | null
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          current_department?: string | null
          current_position?: string | null
          cv_url?: string | null
          education?: string | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          id?: string
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          current_department?: string | null
          current_position?: string | null
          cv_url?: string | null
          education?: string | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          id?: string
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          application_deadline: string | null
          benefits: string[] | null
          contract_type: string
          created_at: string | null
          department: string | null
          description: string
          id: string
          location: string
          recruiter_id: string | null
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string[] | null
          contract_type: string
          created_at?: string | null
          department?: string | null
          description: string
          id?: string
          location: string
          recruiter_id?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          benefits?: string[] | null
          contract_type?: string
          created_at?: string | null
          department?: string | null
          description?: string
          id?: string
          location?: string
          recruiter_id?: string | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_application_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_application_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_application_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_application_id_fkey"
            columns: ["related_application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol1_evaluations: {
        Row: {
          adherence_metier: boolean | null
          adherence_paradigme: boolean | null
          adherence_talent: boolean | null
          application_id: string | null
          completed: boolean | null
          created_at: string | null
          documents_verified: boolean | null
          evaluator_id: string | null
          id: string
          metier_notes: string | null
          overall_score: number | null
          paradigme_notes: string | null
          talent_notes: string | null
          updated_at: string | null
        }
        Insert: {
          adherence_metier?: boolean | null
          adherence_paradigme?: boolean | null
          adherence_talent?: boolean | null
          application_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          documents_verified?: boolean | null
          evaluator_id?: string | null
          id?: string
          metier_notes?: string | null
          overall_score?: number | null
          paradigme_notes?: string | null
          talent_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          adherence_metier?: boolean | null
          adherence_paradigme?: boolean | null
          adherence_talent?: boolean | null
          application_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          documents_verified?: boolean | null
          evaluator_id?: string | null
          id?: string
          metier_notes?: string | null
          overall_score?: number | null
          paradigme_notes?: string | null
          talent_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol1_evaluations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol1_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol2_evaluations: {
        Row: {
          application_id: string | null
          completed: boolean | null
          created_at: string | null
          evaluator_id: string | null
          id: string
          interview_completed: boolean | null
          interview_notes: string | null
          job_sheet_created: boolean | null
          overall_score: number | null
          physical_visit: boolean | null
          qcm_codir_completed: boolean | null
          qcm_codir_score: number | null
          qcm_role_completed: boolean | null
          qcm_role_score: number | null
          skills_gap_assessed: boolean | null
          skills_gap_notes: string | null
          updated_at: string | null
          visit_notes: string | null
        }
        Insert: {
          application_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          evaluator_id?: string | null
          id?: string
          interview_completed?: boolean | null
          interview_notes?: string | null
          job_sheet_created?: boolean | null
          overall_score?: number | null
          physical_visit?: boolean | null
          qcm_codir_completed?: boolean | null
          qcm_codir_score?: number | null
          qcm_role_completed?: boolean | null
          qcm_role_score?: number | null
          skills_gap_assessed?: boolean | null
          skills_gap_notes?: string | null
          updated_at?: string | null
          visit_notes?: string | null
        }
        Update: {
          application_id?: string | null
          completed?: boolean | null
          created_at?: string | null
          evaluator_id?: string | null
          id?: string
          interview_completed?: boolean | null
          interview_notes?: string | null
          job_sheet_created?: boolean | null
          overall_score?: number | null
          physical_visit?: boolean | null
          qcm_codir_completed?: boolean | null
          qcm_codir_score?: number | null
          qcm_role_completed?: boolean | null
          qcm_role_score?: number | null
          skills_gap_assessed?: boolean | null
          skills_gap_notes?: string | null
          updated_at?: string | null
          visit_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocol2_evaluations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocol2_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          matricule: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          matricule?: string | null
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          matricule?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
