export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          description_ru: string | null;
          description_it: string | null;
          price: number | null;
          discount: number;
          materials: string | null;
          category: string | null;
          price_on_request: boolean;
          is_active: boolean;
          sort_order: number;
          is_new: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          description_ru?: string | null;
          description_it?: string | null;
          price?: number | null;
          discount?: number;
          materials?: string | null;
          category?: string | null;
          price_on_request?: boolean;
          is_active?: boolean;
          sort_order?: number;
          is_new?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          description_ru?: string | null;
          description_it?: string | null;
          price?: number | null;
          discount?: number;
          materials?: string | null;
          category?: string | null;
          price_on_request?: boolean;
          is_active?: boolean;
          sort_order?: number;
          is_new?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          sort_order: number;
          object_position: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          sort_order?: number;
          object_position?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          sort_order?: number;
          object_position?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
