-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.certificate_hidden (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  certificate_id uuid,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT certificate_hidden_pkey PRIMARY KEY (id),
  CONSTRAINT certificate_hidden_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.certificates(id)
);
CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  image_url text NOT NULL,
  category character varying NOT NULL,
  issue_date date,
  expiry_date date,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  name_ko text,
  name_en text,
  name_zh text,
  name_id text,
  description_ko text,
  description_en text,
  description_zh text,
  description_id text,
  CONSTRAINT certificates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.equipment_introduction_hidden (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  equipment_id uuid UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT equipment_introduction_hidden_pkey PRIMARY KEY (id),
  CONSTRAINT equipment_introduction_hidden_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment_introductions(id)
);
CREATE TABLE public.equipment_introductions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  icon text NOT NULL,
  features text[] NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  name_ko text,
  name_en text,
  name_zh text,
  name_id text,
  description_ko text,
  description_en text,
  description_zh text,
  description_id text,
  features_ko text[],
  features_en text[],
  features_zh text[],
  features_id text[],
  CONSTRAINT equipment_introductions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  title text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  admin_reply text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  is_private boolean NOT NULL DEFAULT false,
  admin_reply_ko text,
  admin_reply_en text,
  admin_reply_zh text,
  admin_reply_id text,
  CONSTRAINT inquiries_pkey PRIMARY KEY (id),
  CONSTRAINT inquiries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.news (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author_id uuid,
  published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title_ko text,
  title_en text,
  title_zh text,
  title_id text,
  content_ko text,
  content_en text,
  content_zh text,
  content_id text,
  CONSTRAINT news_pkey PRIMARY KEY (id),
  CONSTRAINT news_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.product_hidden (
  product_id uuid NOT NULL,
  hidden_at timestamp with time zone DEFAULT now(),
  hidden_by uuid,
  CONSTRAINT product_hidden_pkey PRIMARY KEY (product_id),
  CONSTRAINT product_hidden_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_hidden_hidden_by_fkey FOREIGN KEY (hidden_by) REFERENCES auth.users(id)
);
CREATE TABLE public.product_introduction_hidden (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT product_introduction_hidden_pkey PRIMARY KEY (id),
  CONSTRAINT product_introduction_hidden_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_introductions(id)
);
CREATE TABLE public.product_introductions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  icon text NOT NULL,
  features text[] NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  detail_images text[] DEFAULT '{}'::text[],
  order integer NOT NULL DEFAULT 0,
  name_ko text,
  name_en text,
  name_zh text,
  name_id text,
  description_ko text,
  description_en text,
  description_zh text,
  description_id text,
  features_ko text[],
  features_en text[],
  features_zh text[],
  features_id text[],
  CONSTRAINT product_introductions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric,
  image_url text,
  category text,
  stock_quantity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by uuid,
  original_price integer,
  discount integer,
  rating numeric,
  reviews integer,
  naver_url text,
  is_new boolean DEFAULT false,
  is_best boolean DEFAULT false,
  sales integer,
  name_ko text,
  name_en text,
  name_zh text,
  name_id text,
  description_ko text,
  description_en text,
  description_zh text,
  description_id text,
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  company text,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.project_hidden (
  project_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT project_hidden_pkey PRIMARY KEY (project_id),
  CONSTRAINT project_hidden_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  location text NOT NULL,
  date text NOT NULL,
  image text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  features text[] NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  category text NOT NULL DEFAULT 'construction'::text,
  title_ko text,
  title_en text,
  title_zh text,
  title_id text,
  location_ko text,
  location_en text,
  location_zh text,
  location_id text,
  description_ko text,
  description_en text,
  description_zh text,
  description_id text,
  features_ko text[],
  features_en text[],
  features_zh text[],
  features_id text[],
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.replies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inquiry_id uuid,
  admin_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  content_ko text,
  content_en text,
  content_zh text,
  content_id text,
  CONSTRAINT replies_pkey PRIMARY KEY (id),
  CONSTRAINT replies_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id),
  CONSTRAINT replies_inquiry_id_fkey FOREIGN KEY (inquiry_id) REFERENCES public.inquiries(id)
);
CREATE TABLE public.resource_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  color character varying DEFAULT '#3B82F6'::character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  name_ko text,
  name_en text,
  name_zh text,
  name_id text,
  CONSTRAINT resource_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.resource_category_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  language character varying NOT NULL CHECK (language::text = ANY (ARRAY['ko'::character varying, 'en'::character varying, 'zh'::character varying]::text[])),
  name character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT resource_category_translations_pkey PRIMARY KEY (id),
  CONSTRAINT resource_category_translations_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.resource_categories(id)
);
CREATE TABLE public.resource_downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid,
  user_id uuid,
  ip_address inet,
  user_agent text,
  downloaded_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT resource_downloads_pkey PRIMARY KEY (id),
  CONSTRAINT resource_downloads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT resource_downloads_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.resource_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL,
  language character varying NOT NULL CHECK (language::text = ANY (ARRAY['ko'::character varying, 'en'::character varying, 'zh'::character varying]::text[])),
  title character varying NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT resource_translations_pkey PRIMARY KEY (id),
  CONSTRAINT resource_translations_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.resources(id)
);
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  file_name character varying NOT NULL,
  file_url text NOT NULL,
  file_size bigint,
  file_type character varying,
  category character varying DEFAULT 'general'::character varying,
  download_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  author_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  title_ko text,
  description_ko text,
  title_en text,
  description_en text,
  title_zh text,
  description_zh text,
  title_id text,
  description_id text,
  CONSTRAINT resources_pkey PRIMARY KEY (id),
  CONSTRAINT resources_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id)
);
CREATE TABLE public.revenue_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text DEFAULT '#3B82F6'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT revenue_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.revenue_categories_backup (
  id uuid,
  name text,
  color text,
  is_active boolean,
  created_at timestamp with time zone
);
CREATE TABLE public.revenue_data (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  date date NOT NULL,
  category text NOT NULL,
  product_name text,
  revenue numeric NOT NULL,
  quantity integer DEFAULT 0,
  unit_price numeric,
  region text,
  customer_type text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by uuid,
  CONSTRAINT revenue_data_pkey PRIMARY KEY (id),
  CONSTRAINT revenue_data_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'user'::app_role,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);