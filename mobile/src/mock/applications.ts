import type { Application, FollowUp, Interview } from '../domain/applications';

export const mockApplications: Application[] = [
  { id: 'app-1', company: 'Northwind Labs', title: 'Senior Backend Engineer', url: 'https://example.com/jobs/1', score: 9, status: 'ready_for_review', resumeVersion: 'v3 (Backend)', coverLetterVersion: 'v2' },
  { id: 'app-2', company: 'Pocketry', title: 'Mobile Engineer (Ionic)', url: 'https://example.com/jobs/4', score: 8, status: 'ready_for_review', resumeVersion: 'v1 (Mobile)', coverLetterVersion: 'v1' },
  { id: 'app-3', company: 'Kite Digital', title: 'Full-Stack Developer', url: 'https://example.com/jobs/2', score: 7, status: 'documents_prepared', resumeVersion: 'v2' },
  { id: 'app-4', company: 'Lumen Analytics', title: 'Data Platform Engineer', url: 'https://example.com/jobs/3', score: 5, status: 'shortlisted' },
  { id: 'app-5', company: 'Brightpath', title: 'Junior QA Automation Engineer', url: 'https://example.com/jobs/6', status: 'discovered' },
  { id: 'app-6', company: 'Helix Cloud', title: 'Platform Engineer', url: 'https://example.com/jobs/7', score: 8, status: 'submitted', appliedAt: '2026-10-08', resumeVersion: 'v3', coverLetterVersion: 'v2' },
  { id: 'app-7', company: 'Orbit Retail', title: 'Backend Developer', url: 'https://example.com/jobs/8', score: 7, status: 'interview', appliedAt: '2026-10-01', resumeVersion: 'v2' },
  { id: 'app-8', company: 'Ardent Systems', title: 'DevOps Engineer', url: 'https://example.com/jobs/5', score: 3, status: 'rejected', appliedAt: '2026-09-22' },
  { id: 'app-9', company: 'Northwind Labs', title: 'Senior Backend Engineer', url: 'https://example.com/jobs/1b', score: 9, status: 'discovered' },
];

export const mockInterviews: Interview[] = [
  { id: 'int-1', company: 'Orbit Retail', title: 'Backend Developer', at: '2026-10-17T10:00:00', kind: 'Technical screen (video)' },
  { id: 'int-2', company: 'Orbit Retail', title: 'Backend Developer', at: '2026-10-22T14:00:00', kind: 'Panel interview' },
];

export const mockFollowUps: FollowUp[] = [
  { id: 'fu-1', company: 'Helix Cloud', task: 'Check in on application status', due: '2026-10-13', done: false },
  { id: 'fu-2', company: 'Orbit Retail', task: 'Send thank-you note after screen', due: '2026-10-18', done: false },
  { id: 'fu-3', company: 'Kite Digital', task: 'Review tailored resume before applying', due: '2026-10-15', done: false },
];
