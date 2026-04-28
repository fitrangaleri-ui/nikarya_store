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
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_payment_methods: {
        Row: {
          account_name: string
          account_number: string
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          provider_name: string
          sort_order: number
          type: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          provider_name: string
          sort_order?: number
          type: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          provider_name?: string
          sort_order?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          discount_amount: number | null
          download_count: number
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          manual_payment_method_id: string | null
          midtrans_order_id: string | null
          midtrans_transaction_id: string | null
          original_total: number | null
          payment_code: string | null
          payment_confirmed_at: string | null
          payment_deadline: string | null
          payment_gateway: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          payment_type: string | null
          product_id: string
          promo_code: string | null
          quantity: number
          snap_token: string | null
          total_price: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number | null
          download_count?: number
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          manual_payment_method_id?: string | null
          midtrans_order_id?: string | null
          midtrans_transaction_id?: string | null
          original_total?: number | null
          payment_code?: string | null
          payment_confirmed_at?: string | null
          payment_deadline?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payment_type?: string | null
          product_id: string
          promo_code?: string | null
          quantity?: number
          snap_token?: string | null
          total_price: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discount_amount?: number | null
          download_count?: number
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          manual_payment_method_id?: string | null
          midtrans_order_id?: string | null
          midtrans_transaction_id?: string | null
          original_total?: number | null
          payment_code?: string | null
          payment_confirmed_at?: string | null
          payment_deadline?: string | null
          payment_gateway?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          payment_type?: string | null
          product_id?: string
          promo_code?: string | null
          quantity?: number
          snap_token?: string | null
          total_price?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_manual_payment_method_id_fkey"
            columns: ["manual_payment_method_id"]
            isOneToOne: false
            referencedRelation: "manual_payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateway_config: {
        Row: {
          api_key: string
          created_at: string
          display_name: string
          environment: string
          gateway_name: string
          id: string
          is_active: boolean
          merchant_id: string | null
          payment_mode: string
          secret_key: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key: string
          created_at?: string
          display_name: string
          environment?: string
          gateway_name: string
          id?: string
          is_active?: boolean
          merchant_id?: string | null
          payment_mode?: string
          secret_key: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string
          display_name?: string
          environment?: string
          gateway_name?: string
          id?: string
          is_active?: boolean
          merchant_id?: string | null
          payment_mode?: string
          secret_key?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          code: string
          created_at: string
          description: string | null
          enabled_payments: string[]
          id: string
          is_active: boolean
          label: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          enabled_payments: string[]
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          enabled_payments?: string[]
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          api_key: string
          environment: string
          gateway_name: string
          id: string
          merchant_id: string | null
          secret_key: string
          updated_at: string | null
        }
        Insert: {
          api_key: string
          environment?: string
          gateway_name: string
          id?: string
          merchant_id?: string | null
          secret_key: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          environment?: string
          gateway_name?: string
          id?: string
          merchant_id?: string | null
          secret_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      product_demo_links: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          label: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          label: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          label?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_demo_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category_id: string | null
          created_at: string
          demo_link: string | null
          demo_url: string | null
          description: string | null
          discount_percent: number | null
          discount_price: number | null
          drive_file_url: string | null
          id: string
          is_active: boolean
          original_price: number | null
          price: number
          product_code: string | null
          sku: string | null
          slug: string
          tags: string[] | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          badge?: string | null
          category_id?: string | null
          created_at?: string
          demo_link?: string | null
          demo_url?: string | null
          description?: string | null
          discount_percent?: number | null
          discount_price?: number | null
          drive_file_url?: string | null
          id?: string
          is_active?: boolean
          original_price?: number | null
          price: number
          product_code?: string | null
          sku?: string | null
          slug: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          badge?: string | null
          category_id?: string | null
          created_at?: string
          demo_link?: string | null
          demo_url?: string | null
          description?: string | null
          discount_percent?: number | null
          discount_price?: number | null
          drive_file_url?: string | null
          id?: string
          is_active?: boolean
          original_price?: number | null
          price?: number
          product_code?: string | null
          sku?: string | null
          slug?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_usages: {
        Row: {
          created_at: string
          discount_amount: number
          guest_email: string | null
          id: string
          order_id: string
          promo_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discount_amount?: number
          guest_email?: string | null
          id?: string
          order_id: string
          promo_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discount_amount?: number
          guest_email?: string | null
          id?: string
          order_id?: string
          promo_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_usages_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "promos"
            referencedColumns: ["id"]
          },
        ]
      }
      promos: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          end_date: string | null
          global_usage_limit: number | null
          id: string
          is_active: boolean
          max_discount_cap: number | null
          min_order_amount: number | null
          name: string
          per_user_usage_limit: number | null
          scope_ref_id: string | null
          scope_type: string
          start_date: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          end_date?: string | null
          global_usage_limit?: number | null
          id?: string
          is_active?: boolean
          max_discount_cap?: number | null
          min_order_amount?: number | null
          name: string
          per_user_usage_limit?: number | null
          scope_ref_id?: string | null
          scope_type?: string
          start_date?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          global_usage_limit?: number | null
          id?: string
          is_active?: boolean
          max_discount_cap?: number | null
          min_order_amount?: number | null
          name?: string
          per_user_usage_limit?: number | null
          scope_ref_id?: string | null
          scope_type?: string
          start_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
    }
    Enums: {
      payment_status:
        | "PENDING"
        | "PAID"
        | "FAILED"
        | "PENDING_MANUAL"
        | "EXPIRED"
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
    Enums: {
      payment_status: [
        "PENDING",
        "PAID",
        "FAILED",
        "PENDING_MANUAL",
        "EXPIRED",
      ],
    },
  },
} as const
