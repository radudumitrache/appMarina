import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { TransitionProvider } from './context/TransitionContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/shared/PrivateRoute'

const Landing             = lazy(() => import('./pages/Landing'))
const Login               = lazy(() => import('./pages/Login'))
const VRDemo              = lazy(() => import('./pages/VRDemo'))
const CrewDashboard       = lazy(() => import('./pages/crew/Dashboard'))
const CrewModules         = lazy(() => import('./pages/crew/Modules'))
const CrewModuleReader    = lazy(() => import('./pages/crew/ModuleReader'))
const CrewTests           = lazy(() => import('./pages/crew/Tests'))
const CrewTestTaker       = lazy(() => import('./pages/crew/TestTaker'))
const CrewProgress        = lazy(() => import('./pages/crew/Progress'))
const CrewTestReview      = lazy(() => import('./pages/crew/TestReview'))
const CrewMyClass         = lazy(() => import('./pages/crew/MyClass'))
const CrewSupport         = lazy(() => import('./pages/crew/Support'))
const CrewProfile         = lazy(() => import('./pages/crew/Profile'))
const TrainerDashboard    = lazy(() => import('./pages/trainer/Dashboard'))
const TrainerClasses      = lazy(() => import('./pages/trainer/Departments'))
const TrainerClassDetail  = lazy(() => import('./pages/trainer/DepartmentDetail'))
const TrainerProgress     = lazy(() => import('./pages/trainer/Progress'))
const TrainerTestBuilder  = lazy(() => import('./pages/trainer/TestBuilder'))
const TrainerTests        = lazy(() => import('./pages/trainer/Tests'))
const TrainerVRPanelEditor= lazy(() => import('./pages/trainer/VRPanelEditor'))
const TrainerCrewProgress       = lazy(() => import('./pages/trainer/CrewProgress'))
const TrainerSubmissionOverview = lazy(() => import('./pages/trainer/SubmissionOverview'))
const TrainerTestSubmissions    = lazy(() => import('./pages/trainer/TestSubmissions'))
const TrainerModuleReader = lazy(() => import('./pages/trainer/ModuleReader'))
const TrainerMedia        = lazy(() => import('./pages/trainer/Media'))
const TrainerSupport      = lazy(() => import('./pages/trainer/Support'))
const TrainerProfile      = lazy(() => import('./pages/trainer/Profile'))
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'))
const AdminOrganisations  = lazy(() => import('./pages/admin/Organisations'))
const AdminUsers          = lazy(() => import('./pages/admin/Users'))
const AdminClasses        = lazy(() => import('./pages/admin/Departments'))
const AdminClassDetail        = lazy(() => import('./pages/admin/DepartmentDetail'))
const AdminCrewProgress       = lazy(() => import('./pages/admin/CrewProgress'))
const AdminSubmissionOverview = lazy(() => import('./pages/admin/SubmissionOverview'))
const AdminMedia          = lazy(() => import('./pages/admin/Media'))
const AdminSupport        = lazy(() => import('./pages/admin/Support'))
const AdminSettings       = lazy(() => import('./pages/admin/Settings'))
const AdminModulePanelEditor = lazy(() => import('./pages/trainer/ModulePanelEditor'))
const AdminTestBuilder       = lazy(() => import('./pages/admin/TestBuilder'))
const AdminCourses           = lazy(() => import('./pages/admin/Courses'))
const AdminCourseDetail      = lazy(() => import('./pages/admin/CourseDetail'))

function PageShell() {
  return (
    <TransitionProvider>
      <Suspense fallback={<div className="page-suspense-fallback" />}>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<Landing />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/vr-demo" element={<VRDemo />} />

          {/* Crew */}
          <Route path="/crew/dashboard" element={<PrivateRoute allowedRoles={['crew']}><CrewDashboard /></PrivateRoute>} />
          <Route path="/crew/modules"      element={<PrivateRoute allowedRoles={['crew']}><CrewModules /></PrivateRoute>} />
          <Route path="/crew/modules/:id" element={<PrivateRoute allowedRoles={['crew']}><CrewModuleReader /></PrivateRoute>} />
          <Route path="/crew/tests/:id" element={<PrivateRoute allowedRoles={['crew']}><CrewTestTaker /></PrivateRoute>} />
          <Route path="/crew/tests"     element={<Navigate to="/crew/modules" replace />} />
          <Route path="/crew/progress"  element={<PrivateRoute allowedRoles={['crew']}><CrewProgress /></PrivateRoute>} />
          <Route path="/crew/tests/:id/review" element={<PrivateRoute allowedRoles={['crew']}><CrewTestReview /></PrivateRoute>} />
          <Route path="/crew/submissions/:submissionId/review" element={<PrivateRoute allowedRoles={['crew']}><CrewTestReview /></PrivateRoute>} />
          <Route path="/crew/my-class"  element={<PrivateRoute allowedRoles={['crew']}><CrewMyClass /></PrivateRoute>} />
          <Route path="/crew/support"   element={<PrivateRoute allowedRoles={['crew']}><CrewSupport /></PrivateRoute>} />
          <Route path="/crew/profile"   element={<PrivateRoute allowedRoles={['crew']}><CrewProfile /></PrivateRoute>} />

          {/* Trainer */}
          <Route path="/trainer/dashboard"    element={<PrivateRoute allowedRoles={['trainer']}><TrainerDashboard /></PrivateRoute>} />
          <Route path="/trainer/departments"      element={<PrivateRoute allowedRoles={['trainer']}><TrainerClasses /></PrivateRoute>} />
          <Route path="/trainer/departments/:id"  element={<PrivateRoute allowedRoles={['trainer']}><TrainerClassDetail /></PrivateRoute>} />
          <Route path="/trainer/progress"     element={<PrivateRoute allowedRoles={['trainer']}><TrainerProgress /></PrivateRoute>} />
          <Route path="/trainer/tests"        element={<Navigate to="/trainer/assignments" replace />} />
          <Route path="/trainer/assignments"  element={<PrivateRoute allowedRoles={['trainer']}><TrainerTestBuilder /></PrivateRoute>} />
          <Route path="/trainer/assignments/:testId/panels/:panelId/vr" element={<PrivateRoute allowedRoles={['trainer', 'admin']}><TrainerVRPanelEditor /></PrivateRoute>} />
          <Route path="/trainer/modules/:id"        element={<PrivateRoute allowedRoles={['trainer']}><TrainerModuleReader /></PrivateRoute>} />
          <Route path="/trainer/crew/:crewId/progress" element={<PrivateRoute allowedRoles={['trainer']}><TrainerCrewProgress /></PrivateRoute>} />
          <Route path="/trainer/tests/:testId/submissions"    element={<PrivateRoute allowedRoles={['trainer']}><TrainerTestSubmissions /></PrivateRoute>} />
          <Route path="/trainer/submissions/:submissionId"   element={<PrivateRoute allowedRoles={['trainer']}><TrainerSubmissionOverview /></PrivateRoute>} />
          <Route path="/trainer/media"        element={<PrivateRoute allowedRoles={['trainer']}><TrainerMedia /></PrivateRoute>} />
          <Route path="/trainer/support"      element={<PrivateRoute allowedRoles={['trainer']}><TrainerSupport /></PrivateRoute>} />
          <Route path="/trainer/profile"      element={<PrivateRoute allowedRoles={['trainer']}><TrainerProfile /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard"       element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/organisations"  element={<PrivateRoute allowedRoles={['admin']}><AdminOrganisations /></PrivateRoute>} />
          <Route path="/admin/users"          element={<PrivateRoute allowedRoles={['admin']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/modules/:id/panels" element={<PrivateRoute allowedRoles={['admin']}><AdminModulePanelEditor /></PrivateRoute>} />
          <Route path="/admin/departments"        element={<PrivateRoute allowedRoles={['admin']}><AdminClasses /></PrivateRoute>} />
          <Route path="/admin/departments/:id"    element={<PrivateRoute allowedRoles={['admin']}><AdminClassDetail /></PrivateRoute>} />
          <Route path="/admin/crew/:crewId/progress" element={<PrivateRoute allowedRoles={['admin']}><AdminCrewProgress /></PrivateRoute>} />
          <Route path="/admin/submissions/:submissionId"   element={<PrivateRoute allowedRoles={['admin']}><AdminSubmissionOverview /></PrivateRoute>} />
          <Route path="/admin/courses"        element={<PrivateRoute allowedRoles={['admin']}><AdminCourses /></PrivateRoute>} />
          <Route path="/admin/courses/:id"    element={<PrivateRoute allowedRoles={['admin']}><AdminCourseDetail /></PrivateRoute>} />
          <Route path="/admin/media"          element={<PrivateRoute allowedRoles={['admin']}><AdminMedia /></PrivateRoute>} />
          <Route path="/admin/tests"            element={<PrivateRoute allowedRoles={['admin']}><AdminTestBuilder /></PrivateRoute>} />
          <Route path="/admin/tests/:testId/panels/:panelId/vr" element={<PrivateRoute allowedRoles={['admin']}><TrainerVRPanelEditor /></PrivateRoute>} />
          <Route path="/admin/support"        element={<PrivateRoute allowedRoles={['admin']}><AdminSupport /></PrivateRoute>} />
          <Route path="/admin/settings"       element={<PrivateRoute allowedRoles={['admin']}><AdminSettings /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </TransitionProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <PageShell />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
