export type ProjectType =
  | "design"
  | "video"
  | "sistemas"
  | "sites"
  | "social_media";

export type ProjectStatus = "draft" | "published" | "archived";

/** Subcategoria dentro do tipo "design". Hoje só existe "impressos". */
export type ProjectSubcategory = "impressos";

/** Tipo de peça impressa dentro da subcategoria "impressos". Hoje só "folder". */
export type PrintPieceType = "folder";

export type MetricHighlight = {
  label: string;
  value: string;
};

/**
 * Mockup 3D de folder bifold (uma dobra, formato A4) — 2 painéis físicos,
 * 4 faces impressas. Fechado mostra front_cover (e back_cover ao orbitar
 * pra trás); abrir revela inner_left + inner_right lado a lado.
 */
export type PrintMockup = {
  front_cover: string;
  back_cover: string;
  inner_left: string;
  inner_right: string;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  type: ProjectType;
  description: string;
  cover_url: string | null;
  media_urls: string[];
  video_embed: string | null;
  metrics: string | null;
  metrics_highlights: MetricHighlight[];
  external_url: string | null;
  featured: boolean;
  status: ProjectStatus;
  sort_order: number;
  subcategory: ProjectSubcategory | null;
  print_piece_type: PrintPieceType | null;
  print_mockup: PrintMockup | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: number;
  about_bio: string | null;
  about_photo_url: string | null;
  whatsapp_number: string | null;
  linkedin_url: string | null;
  email: string | null;
  updated_at: string;
};

export type TrackedLink = {
  id: string;
  code: string;
  project_id: string | null;
  label: string;
  destination_url: string;
  click_count: number;
  created_at: string;
};

/**
 * Conexão persistente com o Google Drive (refresh token). Sem policy de
 * RLS nenhuma — só acessível via service role, nunca no navegador.
 */
export type GoogleDriveConnection = {
  id: number;
  refresh_token: string | null;
  connected_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: Project;
        Insert: Omit<Project, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Project, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<Omit<SiteSettings, "updated_at">>;
        Update: Partial<Omit<SiteSettings, "id" | "updated_at">>;
        Relationships: [];
      };
      tracked_links: {
        Row: TrackedLink;
        Insert: Omit<TrackedLink, "id" | "created_at" | "click_count"> & {
          click_count?: number;
        };
        Update: Partial<Omit<TrackedLink, "id" | "created_at">>;
        Relationships: [];
      };
      google_drive_connection: {
        Row: GoogleDriveConnection;
        Insert: Partial<GoogleDriveConnection>;
        Update: Partial<GoogleDriveConnection>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
