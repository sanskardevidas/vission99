import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AddProject from './pages/admin/AddProject';
import EditProject from './pages/admin/EditProject';
import Leads from './pages/admin/Leads';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import UserDashboard from './pages/dashboard/Dashboard';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import ProjectPartnerDashboard from './pages/partner/ProjectPartnerDashboard';
import ManagerDashboard from './pages/partner/ManagerDashboard';
import { AdminAuthProvider, RequireAdmin } from './admin/AdminAuth';
import AdminLogin from './admin/AdminLogin';
import AdminShell from './admin/AdminShell';
import AdminOverview from './admin/Overview';
import AdminPartners from './admin/Partners';
import AdminSales from './admin/Sales';
import AdminPayments from './admin/Payments';
import { Audit, Commissions, Customers, Projects as AdminProjects, Reports, SettingsPage, Users, Visits } from './admin/More';
import ProtectedRoute from './components/ProtectedRoute';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
        <Route path="/projects/:slug" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
        <Route path="/partner/dashboard" element={<PartnerDashboard />} />
        <Route path="/partner/project-partner/dashboard" element={<ProjectPartnerDashboard />} />
        <Route path="/partner/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
        <Route path="/admin/dashboard" element={<AdminAuthProvider><RequireAdmin><AdminShell /></RequireAdmin></AdminAuthProvider>}>
          <Route index element={<AdminOverview />} />
          <Route path="partners" element={<AdminPartners />} />
          <Route path="customers" element={<Customers />} />
          <Route path="bookings" element={<AdminSales />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="visits" element={<Visits />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit" element={<Audit />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/partner/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
        <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />
        <Route path="/unauthorized" element={<PublicLayout><Unauthorized /></PublicLayout>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PublicLayout><Profile /></PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PublicLayout><UserDashboard /></PublicLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects/add" element={<AddProject />} />
          <Route path="projects/edit/:id" element={<EditProject />} />
          <Route path="leads" element={<Leads />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}