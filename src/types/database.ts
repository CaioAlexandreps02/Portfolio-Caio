export type ProjectType =
  | "design"
  | "video"
  | "sistemas"
  | "sites"
  | "social_media";

export type ProjectStatus = "draft" | "published" | "archived";

export type MetricHighlight = {
  label: string;
  value: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
