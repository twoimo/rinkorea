-- Create product_introductions table
CREATE TABLE IF NOT EXISTS product_introductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  icon TEXT NOT NULL,
  features TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create product_introduction_hidden table
CREATE TABLE IF NOT EXISTS product_introduction_hidden (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES product_introductions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id)
);

-- Create RLS policies
ALTER TABLE product_introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_introduction_hidden ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active products
CREATE POLICY "Allow public read access to active products"
  ON product_introductions
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to manage products
CREATE POLICY "Allow authenticated users to manage products"
  ON product_introductions
  FOR ALL
  TO authenticated
  USING (true);

-- Allow public read access to hidden products
CREATE POLICY "Allow public read access to hidden products"
  ON product_introduction_hidden
  FOR SELECT
  USING (true);

-- Allow authenticated users to manage hidden products
CREATE POLICY "Allow authenticated users to manage hidden products"
  ON product_introduction_hidden
  FOR ALL
  TO authenticated
  USING (true); 