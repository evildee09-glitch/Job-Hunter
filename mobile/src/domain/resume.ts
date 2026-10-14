export type Verification = 'verified' | 'unverified' | 'ai_suggested';

export const verificationLabel: Record<Verification, string> = {
  verified: 'Verified',
  unverified: 'Unverified',
  ai_suggested: 'AI suggestion',
};

export interface Bullet { text: string; v: Verification }
export interface Employment { id: string; title: string; company: string; start: string; end: string; bullets: Bullet[] }
export interface Skill { name: string; level: 'beginner' | 'intermediate' | 'advanced'; v: Verification }
export interface Cert { name: string; issuer: string; year: string; v: Verification }
export interface Education { school: string; degree: string; years: string; v: Verification }
export interface Project { name: string; summary: string; v: Verification }

export interface ResumeVersion {
  id: string; name: string; target: string; profileVersion: number;
  provider: string; model: string; createdAt: string; status: 'draft' | 'approved';
}
export interface DocumentItem { id: string; name: string; type: 'resume' | 'cover letter' | 'upload'; sizeKB: number; createdAt: string }

/**
 * Only VERIFIED skills may be used to tailor a resume. Anything else in the
 * job's requirements is reported as unsupported and is never inserted.
 */
export function splitSkills(required: string[], skills: Skill[]) {
  const verified = new Set(skills.filter((s) => s.v === 'verified').map((s) => s.name.toLowerCase()));
  return {
    supported: required.filter((r) => verified.has(r.toLowerCase())),
    unsupported: required.filter((r) => !verified.has(r.toLowerCase())),
  };
}
