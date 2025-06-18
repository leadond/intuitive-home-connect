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
      auto_cloak_logs: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          new_value: string | null
          old_value: string | null
          status: string
          user_id: string
          website: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          status: string
          user_id: string
          website: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          status?: string
          user_id?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_cloak_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_cloak_settings: {
        Row: {
          auto_update_emails: boolean | null
          auto_update_passwords: boolean | null
          auto_update_phone: boolean | null
          created_at: string | null
          enabled: boolean | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_update_emails?: boolean | null
          auto_update_passwords?: boolean | null
          auto_update_phone?: boolean | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_update_emails?: boolean | null
          auto_update_passwords?: boolean | null
          auto_update_phone?: boolean | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_cloak_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      browser_activity: {
        Row: {
          ads_blocked: number | null
          cookies_blocked: number | null
          created_at: string | null
          id: string
          trackers_blocked: number | null
          user_id: string
          visit_time: string | null
          website: string
        }
        Insert: {
          ads_blocked?: number | null
          cookies_blocked?: number | null
          created_at?: string | null
          id?: string
          trackers_blocked?: number | null
          user_id: string
          visit_time?: string | null
          website: string
        }
        Update: {
          ads_blocked?: number | null
          cookies_blocked?: number | null
          created_at?: string | null
          id?: string
          trackers_blocked?: number | null
          user_id?: string
          visit_time?: string | null
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "browser_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      browser_protection: {
        Row: {
          ad_blocking: boolean | null
          cookie_protection: boolean | null
          created_at: string | null
          fingerprint_protection: boolean | null
          https_upgrade: boolean | null
          id: string
          tracker_blocking: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ad_blocking?: boolean | null
          cookie_protection?: boolean | null
          created_at?: string | null
          fingerprint_protection?: boolean | null
          https_upgrade?: boolean | null
          id?: string
          tracker_blocking?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ad_blocking?: boolean | null
          cookie_protection?: boolean | null
          created_at?: string | null
          fingerprint_protection?: boolean | null
          https_upgrade?: boolean | null
          id?: string
          tracker_blocking?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "browser_protection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          call_type: string
          caller_number: string
          created_at: string | null
          duration: number | null
          id: string
          notes: string | null
          phone_identity_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          call_type: string
          caller_number: string
          created_at?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          phone_identity_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          call_type?: string
          caller_number?: string
          created_at?: string | null
          duration?: number | null
          id?: string
          notes?: string | null
          phone_identity_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_phone_identity_id_fkey"
            columns: ["phone_identity_id"]
            isOneToOne: false
            referencedRelation: "cloaked_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      cloaked_identities: {
        Row: {
          created_at: string | null
          id: string
          name: string
          real_value: string
          status: string
          type: string
          updated_at: string | null
          user_id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          real_value: string
          status?: string
          type: string
          updated_at?: string | null
          user_id: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          real_value?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloaked_identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string | null
          field_name: string
          field_value: string
          id: string
          identity_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          field_name: string
          field_value: string
          id?: string
          identity_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          field_name?: string
          field_value?: string
          id?: string
          identity_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_identity_id_fkey"
            columns: ["identity_id"]
            isOneToOne: false
            referencedRelation: "cloaked_identities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_fields_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_activity_logs: {
        Row: {
          action: string
          details: Json | null
          device_id: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          device_id: string
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          device_id?: string
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_activity_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "smart_home_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      energy_usage: {
        Row: {
          cost_usd: number | null
          created_at: string
          device_id: string | null
          id: string
          recorded_at: string
          solar_generation_kwh: number | null
          usage_kwh: number
          user_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          device_id?: string | null
          id?: string
          recorded_at: string
          solar_generation_kwh?: number | null
          usage_kwh: number
          user_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          device_id?: string | null
          id?: string
          recorded_at?: string
          solar_generation_kwh?: number | null
          usage_kwh?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "energy_usage_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "smart_home_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string | null
          id: string
          member_id: string
          owner_id: string
          permissions: string
          relationship: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id: string
          owner_id: string
          permissions: string
          relationship: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string
          owner_id?: string
          permissions?: string
          relationship?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_monitoring: {
        Row: {
          created_at: string | null
          id: string
          item_value: string
          monitored_item: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_value: string
          monitored_item: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_value?: string
          monitored_item?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_monitoring_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_theft_insurance: {
        Row: {
          coverage_amount: number
          created_at: string | null
          end_date: string
          id: string
          policy_number: string
          start_date: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coverage_amount: number
          created_at?: string | null
          end_date: string
          id?: string
          policy_number: string
          start_date: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coverage_amount?: number
          created_at?: string | null
          end_date?: string
          id?: string
          policy_number?: string
          start_date?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_theft_insurance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      insurance_claims: {
        Row: {
          claim_amount: number
          claim_date: string
          created_at: string | null
          description: string
          id: string
          insurance_id: string
          resolution: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claim_amount: number
          claim_date: string
          created_at?: string | null
          description: string
          id?: string
          insurance_id: string
          resolution?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claim_amount?: number
          claim_date?: string
          created_at?: string | null
          description?: string
          id?: string
          insurance_id?: string
          resolution?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_insurance_id_fkey"
            columns: ["insurance_id"]
            isOneToOne: false
            referencedRelation: "identity_theft_insurance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      monitoring_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string
          id: string
          is_read: boolean | null
          monitoring_id: string | null
          severity: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          is_read?: boolean | null
          monitoring_id?: string | null
          severity: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          is_read?: boolean | null
          monitoring_id?: string | null
          severity?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "monitoring_alerts_monitoring_id_fkey"
            columns: ["monitoring_id"]
            isOneToOne: false
            referencedRelation: "identity_monitoring"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitoring_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      passwords: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          password: string
          updated_at: string | null
          user_id: string
          username: string
          website: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          password: string
          updated_at?: string | null
          user_id: string
          username: string
          website: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          password?: string
          updated_at?: string | null
          user_id?: string
          username?: string
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: "passwords_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string | null
          details: string
          id: string
          nickname: string
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details: string
          id?: string
          nickname: string
          status?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: string
          id?: string
          nickname?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      smart_home_devices: {
        Row: {
          capabilities: Json | null
          created_at: string
          device_id: string
          device_name: string
          device_type: string
          id: string
          last_updated: string
          platform_id: string
          room: string | null
          status: Json | null
          user_id: string
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string
          device_id: string
          device_name: string
          device_type: string
          id?: string
          last_updated?: string
          platform_id: string
          room?: string | null
          status?: Json | null
          user_id: string
        }
        Update: {
          capabilities?: Json | null
          created_at?: string
          device_id?: string
          device_name?: string
          device_type?: string
          id?: string
          last_updated?: string
          platform_id?: string
          room?: string | null
          status?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_home_devices_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "smart_home_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_home_platforms: {
        Row: {
          created_at: string
          credentials: Json
          id: string
          is_connected: boolean
          last_sync: string | null
          platform_name: string
          platform_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credentials: Json
          id?: string
          is_connected?: boolean
          last_sync?: string | null
          platform_name: string
          platform_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credentials?: Json
          id?: string
          is_connected?: boolean
          last_sync?: string | null
          platform_name?: string
          platform_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      totp_codes: {
        Row: {
          created_at: string | null
          id: string
          secret_key: string
          service_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          secret_key: string
          service_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          secret_key?: string
          service_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "totp_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          auto_delete_data: boolean | null
          city: string | null
          country: string | null
          created_at: string | null
          data_retention_days: number | null
          date_of_birth: string | null
          display_name: string | null
          email: string
          email_notifications: boolean | null
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          notify_on_data_breach: boolean | null
          notify_on_deletion_update: boolean | null
          notify_on_identity_alert: boolean | null
          notify_on_new_broker_found: boolean | null
          phone: string | null
          postal_code: string | null
          privacy_level: string
          push_notifications: boolean | null
          sms_notifications: boolean | null
          state: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          auto_delete_data?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          data_retention_days?: number | null
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          email_notifications?: boolean | null
          first_name?: string | null
          id: string
          last_login?: string | null
          last_name?: string | null
          notify_on_data_breach?: boolean | null
          notify_on_deletion_update?: boolean | null
          notify_on_identity_alert?: boolean | null
          notify_on_new_broker_found?: boolean | null
          phone?: string | null
          postal_code?: string | null
          privacy_level?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          state?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          auto_delete_data?: boolean | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          data_retention_days?: number | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          email_notifications?: boolean | null
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          notify_on_data_breach?: boolean | null
          notify_on_deletion_update?: boolean | null
          notify_on_identity_alert?: boolean | null
          notify_on_new_broker_found?: boolean | null
          phone?: string | null
          postal_code?: string | null
          privacy_level?: string
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          state?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      vpn_connections: {
        Row: {
          connection_end: string | null
          connection_start: string | null
          created_at: string | null
          data_used: number | null
          id: string
          ip_address: string | null
          server_location: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connection_end?: string | null
          connection_start?: string | null
          created_at?: string | null
          data_used?: number | null
          id?: string
          ip_address?: string | null
          server_location: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connection_end?: string | null
          connection_start?: string | null
          created_at?: string | null
          data_used?: number | null
          id?: string
          ip_address?: string | null
          server_location?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vpn_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vpn_servers: {
        Row: {
          country_code: string
          created_at: string | null
          id: string
          ip_range: string | null
          location: string
          status: string
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          id?: string
          ip_range?: string | null
          location: string
          status: string
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          id?: string
          ip_range?: string | null
          location?: string
          status?: string
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
