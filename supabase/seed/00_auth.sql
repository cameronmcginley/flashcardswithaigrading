-- Insert test user into auth.users
INSERT INTO auth.users (
    instance_id, 
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_current,
    email_change_token_new
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    timezone('utc'::text, now()),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    '',
    '',
    '',
    '',
    ''
);

-- Insert corresponding identity
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000'::uuid,
    jsonb_build_object(
        'sub', '00000000-0000-0000-0000-000000000000',
        'email', 'test@example.com',
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    '00000000-0000-0000-0000-000000000000',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
);

-- Insert new test user with email nodata@example.com
INSERT INTO auth.users (
    instance_id, 
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    last_sign_in_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_current,
    email_change_token_new
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'nodata@example.com',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    timezone('utc'::text, now()),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    '',
    '',
    '',
    '',
    ''
);

-- Insert corresponding identity for nodata@example.com
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001'::uuid,
    jsonb_build_object(
        'sub', '00000000-0000-0000-0000-000000000001',
        'email', 'nodata@example.com',
        'email_verified', true,
        'phone_verified', false
    ),
    'email',
    '00000000-0000-0000-0000-000000000001',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
);

