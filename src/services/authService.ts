import { supabase } from '../lib/supabase';

export async function loginUser(
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  return {
    data,
    error,
  };
}

export async function registerUser(
  email: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
    });

  return {
    data,
    error,
  };
}

export async function logoutUser() {
  const { error } =
    await supabase.auth.signOut();

  return {
    error,
  };
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function resetPassword(
  email: string
) {
  const { data, error } =
    await supabase.auth.resetPasswordForEmail(
      email
    );

  return {
    data,
    error,
  };
}