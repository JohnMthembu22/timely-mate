import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import LazyRoute from './components/LazyRoute';
import ProtectedRoute from './components/ProtectedRoute';
import ClockInGuard from './components/ClockInGuard';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import PermissionGuard from './components/PermissionGuard';
import { useAppSelector } from './store';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TimeTracking = lazy(() => import('./pages/TimeTracking'));
const Projects = lazy(() => import('./pages/Projects'));
const Tasks = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.Tasks })));
const Calendar = lazy(() => import('./pages/Calendar'));
const Team = lazy(() => import('./pages/Team'));
const WorkforceIntelligence = lazy(() => import('./pages/WorkforceIntelligence'));
const OffsiteWork = lazy(() => import('./pages/OffsiteWork'));
const IncidentReports = lazy(() => import('./pages/OffsiteWork/IncidentReports'));
const ExpenseTracking = lazy(() => import('./pages/ExpenseTracking'));
const IndustryModules = lazy(() => import('./pages/IndustryModules'));
const LearningPortal = lazy(() => import('./pages/LearningPortal'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const HR = lazy(() => import('./pages/HR'));
const Reports = lazy(() => import('./pages/Reports'));
const SessionPersistenceTest = lazy(() => import('./pages/SessionPersistenceTest'));
const Messages = lazy(() => import('./pages/Messages'));
const Meetings = lazy(() => import('./pages/Meetings'));
const Activities = lazy(() => import('./pages/Activities'));
const Freelancers = lazy(() => import('./pages/Freelancers'));
const Procurement = lazy(() => import('./pages/Procurement'));

const AppRoutes = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <>
      <CssBaseline />
      <Routes>
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
            <LazyRoute>
              <Login />
            </LazyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <LazyRoute>
              <Signup />
            </LazyRoute>
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <RoleBasedRedirect>
                  <LazyRoute>
                    <Dashboard />
                  </LazyRoute>
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
                <LazyRoute>
                  <TimeTracking />
                </LazyRoute>
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
                  <LazyRoute>
                    <Projects />
                  </LazyRoute>
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <LazyRoute>
                  <Tasks />
                </LazyRoute>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <LazyRoute>
                  <Calendar />
                </LazyRoute>
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
                  <LazyRoute>
                    <Team />
                  </LazyRoute>
                </PermissionGuard>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workforce-intelligence"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <PermissionGuard permission="canManageTeam" customMessage="Workforce intelligence is available to team leaders and administrators.">
                  <LazyRoute>
                    <WorkforceIntelligence />
                  </LazyRoute>
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
                <LazyRoute>
                  <OffsiteWork />
                </LazyRoute>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/offsite-work/incidents"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <LazyRoute>
                  <IncidentReports />
                </LazyRoute>
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
                  <LazyRoute>
                    <ExpenseTracking />
                  </LazyRoute>
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
                <LazyRoute>
                  <IndustryModules />
                </LazyRoute>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-portal"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <LazyRoute>
                  <LearningPortal />
                </LazyRoute>
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
                  <LazyRoute>
                    <HR />
                  </LazyRoute>
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
                  <LazyRoute>
                    <Reports />
                  </LazyRoute>
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
                  <LazyRoute>
                    <Settings />
                  </LazyRoute>
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
                <LazyRoute>
                  <Profile />
                </LazyRoute>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <LazyRoute>
                  <Meetings />
                </LazyRoute>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <LazyRoute>
                  <Activities />
                </LazyRoute>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activities/:id"
          element={
            <ProtectedRoute>
              <ClockInGuard>
                <LazyRoute>
                  <Activities />
                </LazyRoute>
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
                  <LazyRoute>
                    <Freelancers />
                  </LazyRoute>
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
                  <LazyRoute>
                    <Procurement />
                  </LazyRoute>
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
                <LazyRoute>
                  <Messages />
                </LazyRoute>
              </ClockInGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/session-test"
          element={
            <ProtectedRoute>
              <LazyRoute>
                <SessionPersistenceTest />
              </LazyRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
