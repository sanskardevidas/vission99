import type { Project, Lead } from '../types';

const PROJECTS_KEY = 'hv_projects';
const LEADS_KEY = 'hv_leads';

export function getProjects(): Project[] {
  const data = localStorage.getItem(PROJECTS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function getPublishedProjects(): Project[] {
  return getProjects().filter((p) => p.status === 'published');
}

export function getFeaturedProjects(): Project[] {
  return getPublishedProjects().filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function addProject(project: Project): void {
  const projects = getProjects();
  projects.push(project);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function updateProject(id: string, updates: Partial<Project>): void {
  const projects = getProjects().map((p) =>
    p.id === id ? { ...p, ...updates } : p
  );
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getLeads(): Lead[] {
  const data = localStorage.getItem(LEADS_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function addLead(lead: Lead): void {
  const leads = getLeads();
  leads.push(lead);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function updateLeadStatus(id: string, status: Lead['status']): void {
  const leads = getLeads().map((l) =>
    l.id === id ? { ...l, status } : l
  );
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function deleteLead(id: string): void {
  const leads = getLeads().filter((l) => l.id !== id);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}