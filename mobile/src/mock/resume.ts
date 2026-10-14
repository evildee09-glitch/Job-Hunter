import type { Cert, DocumentItem, Education, Employment, Project, ResumeVersion, Skill } from '../domain/resume';

// SAMPLE DATA ONLY. Replace with the user's real, verified profile in Stage 2.
export const mockProfile = {
  name: 'Sample Candidate',
  email: 'sample@example.com',
  location: 'Sample City',
  summary: 'Software engineer with backend and mobile experience. (Sample text.)',
  version: 4,
};

export const mockEmployment: Employment[] = [
  { id: 'e1', title: 'Backend Engineer', company: 'Sample Corp', start: '2022-03', end: 'Present', bullets: [
    { text: 'Built REST APIs in Python serving internal tools.', v: 'verified' },
    { text: 'Migrated a service database to PostgreSQL.', v: 'verified' },
    { text: 'Reduced report generation time (figure not yet provided).', v: 'unverified' },
    { text: 'Led a team of engineers.', v: 'ai_suggested' },
  ] },
  { id: 'e2', title: 'Junior Developer', company: 'Example Ltd', start: '2020-06', end: '2022-02', bullets: [
    { text: 'Maintained a React front end.', v: 'verified' },
  ] },
];

export const mockSkills: Skill[] = [
  { name: 'Python', level: 'advanced', v: 'verified' },
  { name: 'PostgreSQL', level: 'intermediate', v: 'verified' },
  { name: 'React', level: 'intermediate', v: 'verified' },
  { name: 'TypeScript', level: 'intermediate', v: 'verified' },
  { name: 'FastAPI', level: 'intermediate', v: 'unverified' },
  { name: 'Kubernetes', level: 'beginner', v: 'ai_suggested' },
];

export const mockCerts: Cert[] = [
  { name: 'Sample Cloud Practitioner', issuer: 'Example Issuer', year: '2023', v: 'verified' },
];

export const mockEducation: Education[] = [
  { school: 'Sample University', degree: 'BS Computer Science', years: '2016-2020', v: 'verified' },
];

export const mockProjects: Project[] = [
  { name: 'Job tracker app', summary: 'Personal project to track applications.', v: 'unverified' },
];

export const mockVersions: ResumeVersion[] = [
  { id: 'rv3', name: 'Backend (Northwind Labs)', target: 'Senior Backend Engineer', profileVersion: 4, provider: 'ollama', model: 'llama3.1:8b', createdAt: '2026-10-12', status: 'approved' },
  { id: 'rv2', name: 'Full-stack (Kite Digital)', target: 'Full-Stack Developer', profileVersion: 3, provider: 'ollama', model: 'qwen2.5:7b', createdAt: '2026-10-09', status: 'draft' },
];

export const mockDocuments: DocumentItem[] = [
  { id: 'd1', name: 'Backend-Northwind-v3.pdf', type: 'resume', sizeKB: 112, createdAt: '2026-10-12' },
  { id: 'd2', name: 'CoverLetter-Northwind-v2.docx', type: 'cover letter', sizeKB: 38, createdAt: '2026-10-12' },
  { id: 'd3', name: 'old-resume-import.pdf', type: 'upload', sizeKB: 240, createdAt: '2026-09-30' },
];
