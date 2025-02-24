import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminRoute from '../components/AdminRoute';

// Lazy load components for better performance
const Home = React.lazy(() => import('../pages/Home'));
const Resources = React.lazy(() => import('../pages/Resources'));
const Forum = React.lazy(() => import('../pages/Forum'));
const Support = React.lazy(() => import('../pages/Support'));
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const MoodDetection = React.lazy(() => import('../pages/MoodDetection'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminLogin = React.lazy(() => import('../pages/admin/Login'));
const SupportGroups = React.lazy(() => import('../pages/SupportGroups'));

const AppRoutes = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/support" element={<Support />} />
        <Route path="/support/groups" element={<SupportGroups />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mood" element={<MoodDetection />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;