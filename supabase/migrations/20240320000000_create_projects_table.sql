-- Create projects table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view projects"
    ON public.projects FOR SELECT
    USING (true);

CREATE POLICY "Only admins can create projects"
    ON public.projects FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update projects"
    ON public.projects FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete projects"
    ON public.projects FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER handle_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 