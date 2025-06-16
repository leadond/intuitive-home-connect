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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      images: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          tags: string[] | null
          title: string
          url: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          title: string
          url: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      MDA_Extensions: {
        Row: {
          DDI: string | null
          Ext: string | null
          FirstName: string | null
          HostingProvider: string | null
          LastName: string | null
          LineURI: string
          Name: string | null
          Pool: string | null
          SipAddress: string | null
          Type: string | null
          VoiceEnabled: boolean | null
        }
        Insert: {
          DDI?: string | null
          Ext?: string | null
          FirstName?: string | null
          HostingProvider?: string | null
          LastName?: string | null
          LineURI: string
          Name?: string | null
          Pool?: string | null
          SipAddress?: string | null
          Type?: string | null
          VoiceEnabled?: boolean | null
        }
        Update: {
          DDI?: string | null
          Ext?: string | null
          FirstName?: string | null
          HostingProvider?: string | null
          LastName?: string | null
          LineURI?: string
          Name?: string | null
          Pool?: string | null
          SipAddress?: string | null
          Type?: string | null
          VoiceEnabled?: boolean | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          customization: Json | null
          id: string
          image_id: string
          order_id: string
          position: number
          price: number
          quantity: number
        }
        Insert: {
          created_at?: string | null
          customization?: Json | null
          id?: string
          image_id: string
          order_id: string
          position?: number
          price: number
          quantity?: number
        }
        Update: {
          created_at?: string | null
          customization?: Json | null
          id?: string
          image_id?: string
          order_id?: string
          position?: number
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          id: string
          shipping_address: Json | null
          shopify_order_id: string | null
          status: string
          total: number
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          id?: string
          shipping_address?: Json | null
          shopify_order_id?: string | null
          status?: string
          total?: number
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          id?: string
          shipping_address?: Json | null
          shopify_order_id?: string | null
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
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
    Enums: {},
  },
} as const
