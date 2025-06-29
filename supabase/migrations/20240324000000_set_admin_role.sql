-- Set admin role for the user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = '2019@rinkorea.com'
ON CONFLICT (user_id, role) DO NOTHING; 