-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('resume', 'cover_letter', 'recommendation_letter', 'work_sample', 'portfolio', 'linkedin', 'website', 'other')),
  file_url TEXT,
  content_text TEXT,
  source_url TEXT,
  parsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated resumes table
CREATE TABLE IF NOT EXISTS generated_resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  ats_score INTEGER,
  ats_feedback TEXT[],
  template TEXT DEFAULT 'classic',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT,
  job_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'applied', 'screening', 'interview', 'offer', 'rejected', 'accepted')),
  cover_letter TEXT,
  email_response TEXT,
  resume_id UUID REFERENCES generated_resumes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Generated resumes policies
CREATE POLICY "Users can view own resumes" ON generated_resumes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON generated_resumes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON generated_resumes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON generated_resumes
  FOR DELETE USING (auth.uid() = user_id);

-- Job applications policies
CREATE POLICY "Users can view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for career documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'career-documents',
  'career-documents',
  true,
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'career-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'career-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'career-documents');
CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'career-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Indexes
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS generated_resumes_user_id_idx ON generated_resumes(user_id);
CREATE INDEX IF NOT EXISTS job_applications_user_id_idx ON job_applications(user_id);
