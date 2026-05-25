-- Assign admin role to marwanesoulami06@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'marwanesoulami06@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
