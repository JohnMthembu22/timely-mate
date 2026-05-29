import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { RouteScrollToTop } from './components/RouteScrollToTop';
import LazyRoute from './components/LazyRoute';
import AuthenticatedShell from './components/AuthenticatedShell';
import GuestRoute from './components/GuestRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import PermissionGuard from './components/PermissionGuard';
import { useAppSelector } from './store';
import {
  Dashboard,
  TimeTracking,
  Projects,
  Tasks,
  Calendar,
  Team,
  WorkforceIntelligence,
  OffsiteWork,
  IncidentReports,
  ExpenseTracking,
  IndustryModules,
  LearningPortal,
  Settings,
  Profile,
  HR,
  Reports,
  Messages,
  Meetings,
  Activities,
  Freelancers,
  Procurement,
} from './routes/appPages';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Pricing = lazy(() => import('./pages/Pricing'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const SessionPersistenceTest = lazy(() => import('./pages/SessionPersistenceTest'));

const AppRoutes = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <>
      <CssBaseline />
      <RouteScrollToTop />
      <Routes>
        {/* Public / marketing — lazy + suspense */}
        <Route
          path="/"
          element={
            <LazyRoute>
              <Landing />
            </LazyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LazyRoute>
                <Login />
              </LazyRoute>
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <LazyRoute>
                <Signup />
              </LazyRoute>
            </GuestRoute>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <LazyRoute>
              <AuthCallback />
            </LazyRoute>
          }
        />
        <Route
          path="/auth/reset-password"
          element={
            <LazyRoute>
              <ResetPassword />
            </LazyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <LazyRoute>
                <ForgotPassword />
              </LazyRoute>
            </GuestRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <LazyRoute>
              <Pricing />
            </LazyRoute>
          }
        />
        <Route path="/features" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/integrations" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/updates" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/about" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/careers" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/contact" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/documentation" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/help-center" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/api" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/community" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/privacy" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/terms" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/security" element={<LazyRoute><StaticPage /></LazyRoute>} />
        <Route path="/compliance" element={<LazyRoute><StaticPage /></LazyRoute>} />

        {/* App — single auth shell, eager pages (instant client-side navigation) */}
        <Route element={<AuthenticatedShell />}>
          <Route
            path="/dashboard"
            element={
              <PermissionGuard permission="canAccessDashboard">
                <RoleBasedRedirect>
                  <Dashboard />
                </RoleBasedRedirect>
              </PermissionGuard>
            }
          />
          <Route
            path="/time-tracking"
            element={
              <PermissionGuard permission="canAccessTimeTracking">
                <TimeTracking />
              </PermissionGuard>
            }
          />
          <Route
            path="/projects"
            element={
              <PermissionGuard
                permission="canAccessProjects"
                customMessage="Project access is restricted based on your role and department."
              >
                <Projects />
              </PermissionGuard>
            }
          />
          <Route path="/tasks" element={<Tasks />} />
          <Route
            path="/calendar"
            element={
              <PermissionGuard permission="canAccessCalendar">
                <Calendar />
              </PermissionGuard>
            }
          />
          <Route
            path="/team"
            element={
              <PermissionGuard
                permission="canManageTeam"
                customMessage="Team management access is restricted to team leaders and administrators only."
              >
                <Team />
              </PermissionGuard>
            }
          />
          <Route
            path="/workforce-intelligence"
            element={
              <PermissionGuard
                permission="canManageTeam"
                customMessage="Workforce intelligence is available to team leaders and administrators."
              >
                <WorkforceIntelligence />
              </PermissionGuard>
            }
          />
          <Route
            path="/offsite-work"
            element={
              <PermissionGuard
                permission="canAccessFieldOps"
                customMessage="Field Operations is available to field workers and managers."
              >
                <OffsiteWork />
              </PermissionGuard>
            }
          />
          <Route
            path="/offsite-work/incidents"
            element={
              <PermissionGuard
                permission="canAccessIncidentReports"
                customMessage="Incident reports are available to field workers and managers."
              >
                <IncidentReports />
              </PermissionGuard>
            }
          />
          <Route
            path="/expense-tracking"
            element={
              <PermissionGuard
                permission="canAccessExpenses"
                customMessage="Expense tracking access is restricted to Finance department and administrators only."
              >
                <ExpenseTracking />
              </PermissionGuard>
            }
          />
          <Route path="/industry-modules" element={<IndustryModules />} />
          <Route
            path="/learning-portal"
            element={
              <PermissionGuard permission="canAccessLearning">
                <LearningPortal />
              </PermissionGuard>
            }
          />
          <Route
            path="/hr"
            element={
              <PermissionGuard
                permission="canAccessHR"
                customMessage="HR access is restricted to HR department and administrators only."
              >
                <HR />
              </PermissionGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <PermissionGuard
                permission="canAccessReports"
                allowedRoles={['admin', 'team_leader']}
                customMessage="Reports access is restricted to administrators, managers, and team leaders only."
              >
                <Reports />
              </PermissionGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <PermissionGuard
                permission="canModifySettings"
                customMessage="Settings access is restricted to administrators and IT department only."
              >
                <Settings />
              </PermissionGuard>
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/meetings"
            element={
              <PermissionGuard permission="canAccessMeetings">
                <Meetings />
              </PermissionGuard>
            }
          />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/:id" element={<Activities />} />
          <Route
            path="/freelancers"
            element={
              <PermissionGuard
                permission="canManageTeam"
                customMessage="Freelancer management access is restricted to team leaders and administrators only."
              >
                <Freelancers />
              </PermissionGuard>
            }
          />
          <Route
            path="/procurement"
            element={
              <PermissionGuard
                permission="canAccessProcurement"
                customMessage="Procurement access is restricted to Operations department and administrators only."
              >
                <Procurement />
              </PermissionGuard>
            }
          />
          <Route
            path="/messages"
            element={
              <PermissionGuard permission="canAccessMessages">
                <Messages />
              </PermissionGuard>
            }
          />
          <Route
            path="/session-test"
            element={
              <LazyRoute>
                <SessionPersistenceTest />
              </LazyRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
