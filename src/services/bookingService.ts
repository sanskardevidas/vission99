import { supabase } from '../lib/supabase';

export interface BookingData {
  user_id: string;
  project_id: string;
  project_name: string;
  visit_date: string;
  visit_time: string;
  status?: string;
}

export async function createBooking(
  booking: BookingData
) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([
      {
        ...booking,
        status: booking.status || 'Pending',
      },
    ])
    .select();

  return {
    data,
    error,
  };
}

export async function getUserBookings(
  userId: string
) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    });

  return {
    data,
    error,
  };
}

export async function getBookingById(
  bookingId: string
) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  return {
    data,
    error,
  };
}

export async function updateBookingStatus(
  bookingId: string,
  status: string
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,
    })
    .eq('id', bookingId)
    .select();

  return {
    data,
    error,
  };
}

export async function cancelBooking(
  bookingId: string
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'Cancelled',
    })
    .eq('id', bookingId)
    .select();

  return {
    data,
    error,
  };
}

export async function deleteBooking(
  bookingId: string
) {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  return {
    error,
  };
}