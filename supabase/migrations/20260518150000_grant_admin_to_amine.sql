-- Grant admin role to amineelourani67@gmail.com
-- This migration gives admin privileges to the specified user

-- Insert admin role for the user (will fail if user doesn't exist yet)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'amineelourani67@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
