export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      certificate_hidden: {
        Row: {
          certificate_id: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          certificate_id?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          certificate_id?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_hidden_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          expiry_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          issue_date: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          issue_date?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          issue_date?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_introduction_hidden: {
        Row: {
          created_at: string
          equipment_id: string | null
          id: string
        }
        Insert: {
          created_at?: string
          equipment_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          equipment_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_introduction_hidden_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: true
            referencedRelation: "equipment_introductions"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_introductions: {
        Row: {
          category: string
          created_at: string
          description: string
          features: string[]
          icon: string
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          features: string[]
          icon: string
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          features?: string[]
          icon?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_reply: string | null
          content: string
          created_at: string
          email: string
          id: string
          is_private: boolean
          name: string
          phone: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          content: string
          created_at?: string
          email: string
          id?: string
          is_private?: boolean
          name: string
          phone?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          content?: string
          created_at?: string
          email?: string
          id?: string
          is_private?: boolean
          name?: string
          phone?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_hidden: {
        Row: {
          hidden_at: string | null
          hidden_by: string | null
          product_id: string
        }
        Insert: {
          hidden_at?: string | null
          hidden_by?: string | null
          product_id: string
        }
        Update: {
          hidden_at?: string | null
          hidden_by?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_hidden_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_introduction_hidden: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_introduction_hidden_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "product_introductions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_introductions: {
        Row: {
          created_at: string
          description: string
          detail_images: string[] | null
          features: string[]
          icon: string
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          detail_images?: string[] | null
          features: string[]
          icon: string
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          detail_images?: string[] | null
          features?: string[]
          icon?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          discount: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_best: boolean | null
          is_new: boolean | null
          name: string
          naver_url: string | null
          original_price: number | null
          price: number | null
          rating: number | null
          reviews: number | null
          sales: number | null
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_best?: boolean | null
          is_new?: boolean | null
          name: string
          naver_url?: string | null
          original_price?: number | null
          price?: number | null
          rating?: number | null
          reviews?: number | null
          sales?: number | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_best?: boolean | null
          is_new?: boolean | null
          name?: string
          naver_url?: string | null
          original_price?: number | null
          price?: number | null
          rating?: number | null
          reviews?: number | null
          sales?: number | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_hidden: {
        Row: {
          created_at: string
          project_id: string
        }
        Insert: {
          created_at?: string
          project_id: string
        }
        Update: {
          created_at?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_hidden_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string
          features: string[]
          id: string
          image: string
          location: string
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          description: string
          features?: string[]
          id?: string
          image: string
          location: string
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string
          features?: string[]
          id?: string
          image?: string
          location?: string
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      replies: {
        Row: {
          admin_id: string | null
          content: string
          created_at: string
          id: string
          inquiry_id: string | null
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          content: string
          created_at?: string
          id?: string
          inquiry_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          content?: string
          created_at?: string
          id?: string
          inquiry_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "replies_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
