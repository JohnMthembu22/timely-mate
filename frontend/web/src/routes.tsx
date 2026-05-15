import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import TimeTracking from './pages/TimeTracking';
import Projects from './pages/Projects';
import Calendar from './pages/Calendar';
import Team from './pages/Team';
import OffsiteWork from './pages/OffsiteWork';
import ExpenseTracking from './pages/ExpenseTracking';
import IndustryModules from './pages/IndustryModules';
import LearningPortal from './pages/LearningPortal';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import HR from './pages/HR';
import Reports from './pages/Reports';
import Pricing from './pages/Pricing';
import SessionPersistenceTest from './pages/SessionPersistenceTest';

import Messages from './pages/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import ClockInGuard from './components/ClockInGuard';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import PermissionGuard from './components/PermissionGuard';
import { useAppSelector } from './store';
import Meetings from './pages/Meetings';
import Freelancers from './pages/Freelancers';

import Procurement from './pages/Procurement';

const AppRoutes = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <>
      <CssBaseline />
      <Routes>
        <Route
          path="/"
          element={<Landing />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <RoleBasedRedirect>
                  <Dashboard />
                </RoleBasedRedirect>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/time-tracking"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <TimeTracking />
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard permission="canAccessProjects" customMessage="Project access is restricted based on your role and department.">
                  <Projects />
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <Calendar />
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard permission="canManageTeam" customMessage="Team management access is restricted to team leaders and administrators only.">
                  <Team />
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/offsite-work"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <OffsiteWork />
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expense-tracking"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard permission="canAccessExpenses" customMessage="Expense tracking access is restricted to Finance department and administrators only.">
                  <ExpenseTracking />
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/industry-modules"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <IndustryModules />
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-portal"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <LearningPortal />
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard permission="canAccessHR" customMessage="HR access is restricted to HR department and administrators only.">
                  <HR />
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard 
                  permission="canAccessReports" 
                  allowedRoles={['admin', 'team_leader']}
                  customMessage="Reports access is restricted to administrators, managers, and team leaders only."
                >
                  <Reports />
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard permission="canModifySettings" customMessage="Settings access is restricted to administrators and IT department only.">
                  <Settings />
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <Profile />
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <Meetings />
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancers"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard permission="canManageTeam" customMessage="Freelancer management access is restricted to team leaders and administrators only.">
                  <Freelancers />
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard permission="canAccessProcurement" customMessage="Procurement access is restricted to Operations department and administrators only.">
                  <Procurement />
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <Messages />
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/session-test"
          element={
            <ProtectedRoute>
              <SessionPersistenceTest />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
