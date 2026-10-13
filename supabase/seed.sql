-- ====================================================================
-- SmartLMS Database Seed Script
-- Run this in the Supabase SQL Editor to seed Auth Users, Profiles,
-- Courses (including your Azure Blob Video), and Student Enrollments.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. SEED AUTH USERS (Passwords for all test accounts: Password123!)
-- ---------------------------------------------------------------------
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  confirmed_at
)
VALUES
  -- 1. Admin Account
  (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@smartlms.edu',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sarah Jenkins (System Admin)","role":"admin"}'::jsonb,
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    NOW()
  ),
  -- 2. Teacher Account
  (
    'b0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'teacher@smartlms.edu',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Robert Mitchell","role":"teacher"}'::jsonb,
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    NOW()
  ),
  -- 3. Student Account (Alex Rivera)
  (
    'c0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'student@smartlms.edu',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Alex Rivera","role":"student"}'::jsonb,
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    NOW()
  ),
  -- 4. Additional Student Account (Maya Patel)
  (
    'c0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'maya@smartlms.edu',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Maya Patel","role":"student"}'::jsonb,
    false,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = NOW();

-- ---------------------------------------------------------------------
-- 2. SEED AUTH IDENTITIES (Ensures email/password sign-in in Supabase Auth)
-- ---------------------------------------------------------------------
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
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    jsonb_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'email', 'admin@smartlms.edu'),
    'email',
    'admin@smartlms.edu',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'b00000000-0000-0000-0000-000000000002',
    jsonb_build_object('sub', 'b0000000-0000-0000-0000-000000000002', 'email', 'teacher@smartlms.edu'),
    'email',
    'teacher@smartlms.edu',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    jsonb_build_object('sub', 'c0000000-0000-0000-0000-000000000003', 'email', 'student@smartlms.edu'),
    'email',
    'student@smartlms.edu',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000004',
    jsonb_build_object('sub', 'c0000000-0000-0000-0000-000000000004', 'email', 'maya@smartlms.edu'),
    'email',
    'maya@smartlms.edu',
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at = NOW();

-- ---------------------------------------------------------------------
-- 3. SEED PROFILES TABLE
-- ---------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, role, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Sarah Jenkins (System Admin)', 'admin'::user_role, NOW()),
  ('b0000000-0000-0000-0000-000000000002', 'Dr. Robert Mitchell', 'teacher'::user_role, NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'Alex Rivera', 'student'::user_role, NOW()),
  ('c0000000-0000-0000-0000-000000000004', 'Maya Patel', 'student'::user_role, NOW())
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- ---------------------------------------------------------------------
-- 4. SEED COURSES (Including the Azure Blob training video)
-- ---------------------------------------------------------------------
INSERT INTO public.courses (id, title, description, video_url, created_by, created_at)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'SmartLMS Platform Overview & Training Walkthrough',
    'Comprehensive operational training walkthrough and feature demonstration for the SmartLMS learning platform. Direct video stream powered by your Azure Blob Storage container.',
    'https://smartlms.blob.core.windows.net/course-content/NUST-KSA%20Site%20Demo2.mp4',
    'b0000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '1 day'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'Cloud Infrastructure & Azure Blob Storage Architecture',
    'Master highly scalable cloud architectures, containerized microservices, and direct high-performance media delivery from Azure Blob Storage containers.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'b0000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '3 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'Next.js 15 App Router & PostgreSQL Mastery',
    'Deep dive into React Server Components, Next.js Server Actions, Row Level Security (RLS) policies in PostgreSQL, and responsive Tailwind interfaces.',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'a0000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  video_url = EXCLUDED.video_url,
  created_by = EXCLUDED.created_by;

-- ---------------------------------------------------------------------
-- 5. SEED ENROLLMENTS (Alex Rivera and Maya Patel enrolled)
-- ---------------------------------------------------------------------
INSERT INTO public.enrollments (id, student_id, course_id, created_at)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 day'
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '2 days'
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000001',
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT (student_id, course_id) DO NOTHING;

