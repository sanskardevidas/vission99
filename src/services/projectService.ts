import { supabase } from '../lib/supabase';

export interface ProjectData {
  id?: string;
  title: string;
  slug: string;
  location: string;
  price: string;
  description?: string;
  image?: string;
  builder?: string;
  property_type?: string;
  status?: string;
  possession?: string;
}

export async function getAllProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  return {
    data,
    error,
  };
}

export async function getProjectById(
  projectId: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  return {
    data,
    error,
  };
}

export async function getProjectBySlug(
  slug: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single();

  return {
    data,
    error,
  };
}

export async function createProject(
  project: ProjectData
) {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select();

  return {
    data,
    error,
  };
}

export async function updateProject(
  projectId: string,
  project: Partial<ProjectData>
) {
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', projectId)
    .select();

  return {
    data,
    error,
  };
}

export async function deleteProject(
  projectId: string
) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  return {
    error,
  };
}

export async function searchProjects(
  keyword: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .or(
      `title.ilike.%${keyword}%,location.ilike.%${keyword}%`
    );

  return {
    data,
    error,
  };
}

export async function getProjectsByLocation(
  location: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .ilike('location', `%${location}%`);

  return {
    data,
    error,
  };
}

export async function getProjectsByType(
  propertyType: string
) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('property_type', propertyType);

  return {
    data,
    error,
  };
}