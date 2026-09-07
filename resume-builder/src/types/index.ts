export interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  location: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  summary: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  name: string
  type: DocumentType
  file_url: string | null
  content_text: string | null
  source_url: string | null
  parsed: boolean
  created_at: string
}

export type DocumentType =
  | 'resume'
  | 'cover_letter'
  | 'recommendation_letter'
  | 'work_sample'
  | 'portfolio'
  | 'linkedin'
  | 'website'
  | 'other'

export interface ExtractedExperience {
  company: string
  title: string
  start_date: string
  end_date: string | null
  current: boolean
  description: string
  achievements: string[]
  location: string | null
}

export interface ExtractedEducation {
  institution: string
  degree: string
  field: string | null
  start_date: string | null
  end_date: string | null
  gpa: string | null
  honors: string | null
}

export interface ExtractedSkill {
  name: string
  category: string
  level: string | null
}

export interface ConsolidatedProfile {
  full_name: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
  summary: string
  experiences: ExtractedExperience[]
  education: ExtractedEducation[]
  skills: ExtractedSkill[]
  certifications: string[]
  languages: string[]
  awards: string[]
}

export interface GeneratedResume {
  id: string
  user_id: string
  title: string
  content: ConsolidatedProfile
  ats_score: number | null
  ats_feedback: string[] | null
  template: string
  created_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  company_name: string
  job_title: string
  job_description: string | null
  job_url: string | null
  status: ApplicationStatus
  cover_letter: string | null
  email_response: string | null
  resume_id: string | null
  created_at: string
  updated_at: string
}

export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'accepted'

export interface ATSAnalysis {
  score: number
  keyword_matches: string[]
  missing_keywords: string[]
  suggestions: string[]
  formatting_issues: string[]
  strengths: string[]
}
