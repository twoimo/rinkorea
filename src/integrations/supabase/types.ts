export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
          description_en: string | null
          description_id: string | null
          description_ko: string | null
          description_zh: string | null
          expiry_date: string | null
          id: string
          image_url: string
          is_active: boolean | null
          issue_date: string | null
          name: string
          name_en: string | null
          name_id: string | null
          name_ko: string | null
          name_zh: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          expiry_date?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
          issue_date?: string | null
          name: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          expiry_date?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          issue_date?: string | null
          name?: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
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
          description_en: string | null
          description_id: string | null
          description_ko: string | null
          description_zh: string | null
          features: string[]
          features_en: string[] | null
          features_id: string[] | null
          features_ko: string[] | null
          features_zh: string[] | null
          icon: string
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          name_en: string | null
          name_id: string | null
          name_ko: string | null
          name_zh: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          features: string[]
          features_en?: string[] | null
          features_id?: string[] | null
          features_ko?: string[] | null
          features_zh?: string[] | null
          icon: string
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          features?: string[]
          features_en?: string[] | null
          features_id?: string[] | null
          features_ko?: string[] | null
          features_zh?: string[] | null
          icon?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          admin_reply: string | null
          admin_reply_en: string | null
          admin_reply_id: string | null
          admin_reply_ko: string | null
          admin_reply_zh: string | null
          category: string
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
          admin_reply_en?: string | null
          admin_reply_id?: string | null
          admin_reply_ko?: string | null
          admin_reply_zh?: string | null
          category?: string
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
          admin_reply_en?: string | null
          admin_reply_id?: string | null
          admin_reply_ko?: string | null
          admin_reply_zh?: string | null
          category?: string
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
          content_en: string | null
          content_id: string | null
          content_ko: string | null
          content_zh: string | null
          created_at: string
          id: string
          published: boolean
          title: string
          title_en: string | null
          title_id: string | null
          title_ko: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          content_en?: string | null
          content_id?: string | null
          content_ko?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title: string
          title_en?: string | null
          title_id?: string | null
          title_ko?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          content_en?: string | null
          content_id?: string | null
          content_ko?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title?: string
          title_en?: string | null
          title_id?: string | null
          title_ko?: string | null
          title_zh?: string | null
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
          description_en: string | null
          description_id: string | null
          description_ko: string | null
          description_zh: string | null
          detail_images: string[] | null
          features: string[]
          features_en: string[] | null
          features_id: string[] | null
          features_ko: string[] | null
          features_zh: string[] | null
          icon: string
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          name_en: string | null
          name_id: string | null
          name_ko: string | null
          name_zh: string | null
          order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          detail_images?: string[] | null
          features: string[]
          features_en?: string[] | null
          features_id?: string[] | null
          features_ko?: string[] | null
          features_zh?: string[] | null
          icon: string
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
          order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          detail_images?: string[] | null
          features?: string[]
          features_en?: string[] | null
          features_id?: string[] | null
          features_ko?: string[] | null
          features_zh?: string[] | null
          icon?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
          order?: number
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
          description_en: string | null
          description_id: string | null
          description_ko: string | null
          description_zh: string | null
          discount: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_best: boolean | null
          is_new: boolean | null
          name: string
          name_en: string | null
          name_id: string | null
          name_ko: string | null
          name_zh: string | null
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
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          discount?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_best?: boolean | null
          is_new?: boolean | null
          name: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
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
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          discount?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_best?: boolean | null
          is_new?: boolean | null
          name?: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
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
          description_en: string | null
          description_id: string | null
          description_ko: string | null
          description_zh: string | null
          features: string[]
          features_en: string[] | null
          features_id: string[] | null
          features_ko: string[] | null
          features_zh: string[] | null
          id: string
          image: string
          location: string
          location_en: string | null
          location_id: string | null
          location_ko: string | null
          location_zh: string | null
          title: string
          title_en: string | null
          title_id: string | null
          title_ko: string | null
          title_zh: string | null
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          description: string
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          features?: string[]
          features_en?: string[] | null
          features_id?: string[] | null
          features_ko?: string[] | null
          features_zh?: string[] | null
          id?: string
          image: string
          location: string
          location_en?: string | null
          location_id?: string | null
          location_ko?: string | null
          location_zh?: string | null
          title: string
          title_en?: string | null
          title_id?: string | null
          title_ko?: string | null
          title_zh?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          features?: string[]
          features_en?: string[] | null
          features_id?: string[] | null
          features_ko?: string[] | null
          features_zh?: string[] | null
          id?: string
          image?: string
          location?: string
          location_en?: string | null
          location_id?: string | null
          location_ko?: string | null
          location_zh?: string | null
          title?: string
          title_en?: string | null
          title_id?: string | null
          title_ko?: string | null
          title_zh?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      replies: {
        Row: {
          admin_id: string | null
          content: string
          content_en: string | null
          content_id: string | null
          content_ko: string | null
          content_zh: string | null
          created_at: string
          id: string
          inquiry_id: string | null
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          content: string
          content_en?: string | null
          content_id?: string | null
          content_ko?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          inquiry_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          content?: string
          content_en?: string | null
          content_id?: string | null
          content_ko?: string | null
          content_zh?: string | null
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
      resource_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          name_id: string | null
          name_ko: string | null
          name_zh: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          name_id?: string | null
          name_ko?: string | null
          name_zh?: string | null
        }
        Relationships: []
      }
      resource_category_translations: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          language: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          language: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          language?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "resource_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_category_translations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "resource_categories_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_downloads: {
        Row: {
          downloaded_at: string
          id: string
          ip_address: unknown | null
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_downloads_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_downloads_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_translations: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language: string
          resource_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language: string
          resource_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string
          resource_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_translations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_translations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources_with_translations"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          author_id: string | null
          category: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_id: string | null
          description_ko: string | null
          description_zh: string | null
          download_count: number | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_active: boolean | null
          title: string
          title_en: string | null
          title_id: string | null
          title_ko: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          download_count?: number | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          title: string
          title_en?: string | null
          title_id?: string | null
          title_ko?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_id?: string | null
          description_ko?: string | null
          description_zh?: string | null
          download_count?: number | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          title?: string
          title_en?: string | null
          title_id?: string | null
          title_ko?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      revenue_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      revenue_categories_backup: {
        Row: {
          color: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
        }
        Relationships: []
      }
      revenue_data: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          customer_type: string | null
          date: string
          id: string
          notes: string | null
          product_name: string | null
          quantity: number | null
          region: string | null
          revenue: number
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          customer_type?: string | null
          date: string
          id?: string
          notes?: string | null
          product_name?: string | null
          quantity?: number | null
          region?: string | null
          revenue: number
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          customer_type?: string | null
          date?: string
          id?: string
          notes?: string | null
          product_name?: string | null
          quantity?: number | null
          region?: string | null
          revenue?: number
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: []
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
      resource_categories_with_translations: {
        Row: {
          color: string | null
          created_at: string | null
          id: string | null
          is_active: boolean | null
          name_en: string | null
          name_ko: string | null
          name_zh: string | null
          original_name: string | null
        }
        Relationships: []
      }
      resources_with_translations: {
        Row: {
          author_id: string | null
          category: string | null
          created_at: string | null
          description_en: string | null
          description_ko: string | null
          description_zh: string | null
          download_count: number | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string | null
          is_active: boolean | null
          original_description: string | null
          original_title: string | null
          title_en: string | null
          title_ko: string | null
          title_zh: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      batch_update_document_vectors: {
        Args: { document_ids: string[]; mark_for_reprocessing?: boolean }
        Returns: number
      }
      cleanup_orphaned_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      delete_collection_embeddings: {
        Args: { collection_id: string }
        Returns: number
      }
      delete_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      delete_user_account: {
        Args: { user_id: string }
        Returns: undefined
      }
      generate_revenue_test_data: {
        Args: Record<PropertyKey, never> | { record_count?: number }
        Returns: undefined
      }
      get_localized_array: {
        Args:
          | { arr: string[]; lang: string }
          | {
              array_ko: string[]
              array_en: string[]
              array_zh: string[]
              array_id: string[]
              lang?: string
            }
          | { key: string; locale: string }
        Returns: string[]
      }
      get_localized_text: {
        Args:
          | {
              base_text: string
              lang: string
              en: string
              ko: string
              zh: string
              id: string
            }
          | { key: string; locale: string }
          | {
              text_ko: string
              text_en: string
              text_zh: string
              text_id: string
              lang?: string
            }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_vectorization_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      refresh_vector_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      resync_collection_documents: {
        Args: { collection_name?: string }
        Returns: Json
      }
      search_documents: {
        Args: {
          query_embedding: string
          collection_ids?: string[]
          similarity_threshold?: number
          match_count?: number
          source_types?: string[]
        }
        Returns: {
          id: string
          document_id: string
          title: string
          content: string
          source_type: string
          source_id: string
          similarity: number
          metadata: Json
        }[]
      }
      search_documents_optimized: {
        Args: {
          query_embedding: string
          collection_ids?: string[]
          similarity_threshold?: number
          match_count?: number
          source_types?: string[]
          language_filter?: string
        }
        Returns: {
          id: string
          document_id: string
          title: string
          content: string
          source_type: string
          source_id: string
          similarity: number
          metadata: Json
          collection_name: string
        }[]
      }
      split_long_documents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_daily_usage_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      app_role: ["admin", "user"],
    },
  },
} as const
