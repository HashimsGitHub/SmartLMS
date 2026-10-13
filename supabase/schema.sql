-- ====================================================================
-- SmartLMS Database Schema & Row Level Security (RLS) Policies
-- Paste and execute this script inside the Supabase SQL Editor
-- ====================================================================

-- 1. Setup Role Enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'student'::user_role NOT NULL
);

-- 3. Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT, -- Azure Blob Storage direct streaming link
  created_by UUID REFERENCES profiles(id)
);

-- 4. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(student_id, course_id)
);

-- 5. Row Level Security (RLS) Enablement
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 6. Helper function for handle_new_user trigger (auto-creates profile upon Supabase Auth sign up)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute when a new user signs up via Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Drop existing policies before recreating to ensure idempotency
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow individual write access to own profile" ON profiles;
DROP POLICY IF EXISTS "Allow admin update access to all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow insert to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow read access to courses for authed users" ON courses;
DROP POLICY IF EXISTS "Allow write access to courses for admins and teachers" ON courses;
DROP POLICY IF EXISTS "Allow read access to own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Allow write access to enrollments for admins and teachers" ON enrollments;

-- 8. Apply RLS Policies
-- Profiles: Users can read all profiles (to see teacher/student lists), but only updates their own. Admins can update any.
CREATE POLICY "Allow public read access to profiles" ON profiles 
  FOR SELECT USING (true);

CREATE POLICY "Allow individual write access to own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admin update access to all profiles" ON profiles 
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Allow insert to profiles" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Courses: Read access allowed for authenticated users. Write/Delete restricted to admin/teacher.
CREATE POLICY "Allow read access to courses for authed users" ON courses 
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow write access to courses for admins and teachers" ON courses 
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

-- Enrollments: Admins/teachers full control. Students read-only to their own enrollments.
CREATE POLICY "Allow read access to own enrollments" ON enrollments 
  FOR SELECT USING (
    auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher'))
  );

CREATE POLICY "Allow write access to enrollments for admins and teachers" ON enrollments 
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'teacher')));

