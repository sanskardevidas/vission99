import { Navigate } from 'react-router-dom';

// Resets now happen by SMS OTP on /forgot-password; old email-link URLs land there.
export default function ResetPassword() {
  return <Navigate to="/forgot-password" replace />;
}
