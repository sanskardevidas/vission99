import { supabase } from '../lib/supabase';
import type { Project, Lead } from '../types';

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data as Project[];
}

export async function getPublishedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published projects:', error);
    return [];
  }
  return data as Project[];
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
  return data as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching project by slug:', error);
    return undefined;
  }
  return data as Project | undefined;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching project by id:', error);
    return undefined;
  }
  return data as Project | undefined;
}

export async function addProject(project: Project): Promise<void> {
  const { error } = await supabase.from('projects').insert(project);
  if (error) {
    console.error('Error adding project:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const { error } = await supabase.from('projects').update(updates).eq('id', id);
  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
  return data as Lead[];
}

export async function addLead(lead: Lead): Promise<void> {
  const { error } = await supabase.from('leads').insert(lead);
  if (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
}

export async function updateLeadStatus(id: string, status: Lead['status']): Promise<void> {
  const { error } = await supabase.from('leads').update({ status }).eq('id', id);
  if (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}