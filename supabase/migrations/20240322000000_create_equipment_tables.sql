-- Create equipment_introductions table
CREATE TABLE IF NOT EXISTS equipment_introductions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  icon TEXT NOT NULL,
  features TEXT[] NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create equipment_introduction_hidden table
CREATE TABLE IF NOT EXISTS equipment_introduction_hidden (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID REFERENCES equipment_introductions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(equipment_id)
);

-- Create RLS policies
ALTER TABLE equipment_introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_introduction_hidden ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active equipment
CREATE POLICY "Allow public read access to active equipment"
  ON equipment_introductions
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to manage equipment
CREATE POLICY "Allow authenticated users to manage equipment"
  ON equipment_introductions
  FOR ALL
  TO authenticated
  USING (true);

-- Allow public read access to hidden equipment
CREATE POLICY "Allow public read access to hidden equipment"
  ON equipment_introduction_hidden
  FOR SELECT
  USING (true);

-- Allow authenticated users to manage hidden equipment
CREATE POLICY "Allow authenticated users to manage hidden equipment"
  ON equipment_introduction_hidden
  FOR ALL
  TO authenticated
  USING (true); 