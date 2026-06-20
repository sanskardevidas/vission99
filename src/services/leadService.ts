import { supabase } from '../lib/supabase';

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  location?: string;
  property_type?: string;
  budget?: string;
  message?: string;
  source?: string;
}

export async function createLead(
  lead: LeadData
) {
  const { data, error } = await supabase
    .from('leads')
    .insert([
      {
        ...lead,
        status: 'New',
      },
    ])
    .select();

  return {
    data,
    error,
  };
}

export async function getAllLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', {
      ascending: false,
    });

  return {
    data,
    error,
  };
}

export async function getLeadById(
  leadId: string
) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  return {
    data,
    error,
  };
}

export async function updateLeadStatus(
  leadId: string,
  status: string
) {
  const { data, error } = await supabase
    .from('leads')
    .update({
      status,
    })
    .eq('id', leadId)
    .select();

  return {
    data,
    error,
  };
}

export async function assignLead(
  leadId: string,
  assignedTo: string
) {
  const { data, error } = await supabase
    .from('leads')
    .update({
      assigned_to: assignedTo,
    })
    .eq('id', leadId)
    .select();

  return {
    data,
    error,
  };
}

export async function deleteLead(
  leadId: string
) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  return {
    error,
  };
}

export async function getLeadStats() {
  const { data, error } = await supabase
    .from('leads')
    .select('status');

  if (error) {
    return {
      total: 0,
      newLeads: 0,
      contacted: 0,
      closed: 0,
      error,
    };
  }

  const total = data.length;

  const newLeads = data.filter(
    (lead) => lead.status === 'New'
  ).length;

  const contacted = data.filter(
    (lead) => lead.status === 'Contacted'
  ).length;

  const closed = data.filter(
    (lead) => lead.status === 'Closed'
  ).length;

  return {
    total,
    newLeads,
    contacted,
    closed,
    error: null,
  };
}