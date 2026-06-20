import { supabase } from '../lib/supabase';

export async function getFavorites(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId);

  return {
    data,
    error,
  };
}

export async function addFavorite(
  userId: string,
  projectId: string
) {
  const { data, error } = await supabase
    .from('favorites')
    .insert([
      {
        user_id: userId,
        project_id: projectId,
      },
    ])
    .select();

  return {
    data,
    error,
  };
}

export async function removeFavorite(
  userId: string,
  projectId: string
) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('project_id', projectId);

  return {
    error,
  };
}

export async function isFavorite(
  userId: string,
  projectId: string
) {
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .maybeSingle();

  return {
    isFavorite: !!data,
    error,
  };
}