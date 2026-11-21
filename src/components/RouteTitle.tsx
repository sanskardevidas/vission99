import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

const BRAND = 'VISSION99 AQAAR';
const HOME_TITLE = 'VISSION99 AQAAR | Verified Real Estate in India, Dubai & UK';

// First match wins. Keeps the browser tab title in sync with the current route
// (direct loads, in-app navigation and back/forward all go through useLocation).
const TITLES: [string, string][] = [
  ['/', 'Home'],
  ['/projects', 'Projects'],
  ['/projects/:slug', 'Project Details'],
  ['/login', 'Login'],
  ['/register', 'Register'],
  ['/partner/register', 'Register'],
  ['/forgot-password', 'Forgot Password'],
  ['/reset-password', 'Reset Password'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
  ['/rera-disclaimer', 'RERA Disclaimer'],
  ['/unauthorized', 'Unauthorized'],
  ['/profile', 'Profile'],
  ['/dashboard', 'My Dashboard'],
  ['/partner/dashboard', 'CP Dashboard'],
  ['/partner/project-partner/dashboard', 'PP Dashboard'],
  ['/partner/manager/dashboard', 'Manager Dashboard'],
  ['/admin/login', 'Admin Login'],
  ['/admin/dashboard', 'Admin Dashboard'],
  ['/admin/dashboard/partners', 'Partners & Hierarchy'],
  ['/admin/dashboard/customers', 'Customers'],
  ['/admin/dashboard/bookings', 'Sales & Bookings'],
  ['/admin/dashboard/payments', 'Payment Verification'],
  ['/admin/dashboard/visits', 'Site Visits'],
  ['/admin/dashboard/projects', 'Projects & Plots'],
  ['/admin/dashboard/commissions', 'Commissions & Payouts'],
  ['/admin/dashboard/reports', 'Reports & Analytics'],
  ['/admin/dashboard/audit', 'Audit Logs'],
  ['/admin/dashboard/users', 'User Management'],
  ['/admin/dashboard/settings', 'Settings'],
  ['/admin', 'Admin Panel'],
  ['/admin/projects/add', 'Add Project'],
  ['/admin/projects/edit/:id', 'Edit Project'],
  ['/admin/leads', 'Leads'],
];

export function titleFor(pathname: string): string {
  if (pathname === '/') return HOME_TITLE;
  const hit = TITLES.find(([pattern]) => matchPath({ path: pattern, end: true }, pathname));
  return hit ? `${BRAND} | ${hit[1]}` : BRAND;
}

export default function RouteTitle() {
  const { pathname } = useLocation();
  useEffect(() => { document.title = titleFor(pathname); }, [pathname]);
  return null;
}
