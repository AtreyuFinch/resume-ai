import { GeneratedResume } from '@/types'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface ResumePreviewProps {
  resume: GeneratedResume
}

export function ResumePreview({ resume }: ResumePreviewProps) {
  const c = resume.content

  return (
    <Card className="shadow-sm">
      <CardContent className="p-8">
        {/* Header */}
        <div className="border-b-2 border-gray-900 pb-4 mb-5">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{c.full_name}</h1>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-600">
            {c.email && <span>{c.email}</span>}
            {c.phone && <><span className="text-gray-300">|</span><span>{c.phone}</span></>}
            {c.location && <><span className="text-gray-300">|</span><span>{c.location}</span></>}
            {c.linkedin && (
              <>
                <span className="text-gray-300">|</span>
                <a href={c.linkedin} className="text-indigo-600 hover:underline truncate max-w-[200px]">
                  LinkedIn
                </a>
              </>
            )}
            {c.portfolio && (
              <>
                <span className="text-gray-300">|</span>
                <a href={c.portfolio} className="text-indigo-600 hover:underline truncate max-w-[200px]">
                  Portfolio
                </a>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        {c.summary && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Professional Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{c.summary}</p>
          </section>
        )}

        {/* Experience */}
        {c.experiences.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {c.experiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{exp.title}</p>
                      <p className="text-sm text-gray-600">
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4 mt-0.5">
                      {exp.start_date} – {exp.end_date ?? 'Present'}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{exp.description}</p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {exp.achievements.map((a, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-indigo-500 mt-1 shrink-0">•</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {c.education.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              Education
            </h2>
            <div className="space-y-2">
              {c.education.map((edu, i) => (
                <div key={i} className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      {edu.institution}
                      {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                      {edu.honors ? ` · ${edu.honors}` : ''}
                    </p>
                  </div>
                  {edu.end_date && (
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-4 mt-0.5">
                      {edu.end_date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {c.skills.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Skills
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {c.skills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {c.certifications.length > 0 && (
          <section className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Certifications
            </h2>
            <ul className="space-y-1">
              {c.certifications.map((cert, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-indigo-500">•</span>
                  {cert}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {c.languages.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Languages
            </h2>
            <p className="text-sm text-gray-700">{c.languages.join(', ')}</p>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
