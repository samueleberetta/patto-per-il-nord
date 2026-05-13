export interface Province {
  id: string;
  name: string;
  slug: string;
}

export interface Municipality {
  id: string;
  province_id: string;
  name: string;
  slug: string;
  has_sede: boolean;
  featured: boolean;
  contact_phone: string | null;
  contact_email: string | null;
  lat: number | null;
  lng: number | null;
}

export interface Role {
  id: string;
  province_id: string;
  municipality_id: string | null;
  role_title: string;
  person_name: string;
  photo_url: string | null;
  bio: string | null;
  email: string | null;
  display_order: number;
}

export interface NewsArticle {
  id: string;
  province_id: string;
  municipality_id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  image_urls: string[] | null;
  featured: boolean;
  published_at: string;
  created_at: string;
}

export interface Event {
  id: string;
  province_id: string;
  municipality_id: string | null;
  title: string;
  description: string | null;
  event_type:
    | "banchetto"
    | "incontro_pubblico"
    | "manifestazione"
    | "cena"
    | "cultura"
    | "sport"
    | "sociale"
    | "intervento_tv"
    | "associazionismo";
  event_date: string;
  event_time: string | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  contact_email: string | null;
  contact_phone: string | null;
  author: string | null;
  municipality?: Municipality;
}
