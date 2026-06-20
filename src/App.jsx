import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { TransitionProvider } from './context/TransitionContext'
import { ThemeProvider } from './context/ThemeContext'
import PrivateRoute from './components/shared/PrivateRoute'

const Landing             = lazy(() => import('./pages/Landing'))
const Login               = lazy(() => import('./pages/Login'))
const VRDemo              = lazy(() => import('./pages/VRDemo'))
const StudentDashboard    = lazy(() => import('./pages/student/Dashboard'))
const StudentModules      = lazy(() => import('./pages/student/Modules'))
const StudentModuleReader = lazy(() => import('./pages/student/ModuleReader'))
const StudentTests        = lazy(() => import('./pages/student/Tests'))
const StudentTestTaker    = lazy(() => import('./pages/student/TestTaker'))
const StudentProgress     = lazy(() => import('./pages/student/Progress'))
const StudentTestReview   = lazy(() => import('./pages/student/TestReview'))
const StudentMyClass      = lazy(() => import('./pages/student/MyClass'))
const StudentSupport      = lazy(() => import('./pages/student/Support'))
const StudentProfile      = lazy(() => import('./pages/student/Profile'))
const TrainerDashboard    = lazy(() => import('./pages/trainer/Dashboard'))
const TrainerClasses      = lazy(() => import('./pages/trainer/Departments'))
const TrainerClassDetail  = lazy(() => import('./pages/trainer/DepartmentDetail'))
const TrainerProgress     = lazy(() => import('./pages/trainer/Progress'))
const TrainerTestBuilder  = lazy(() => import('./pages/trainer/TestBuilder'))
const TrainerTests        = lazy(() => import('./pages/trainer/Tests'))
const TrainerVRPanelEditor= lazy(() => import('./pages/trainer/VRPanelEditor'))
const TrainerStudentProgress    = lazy(() => import('./pages/trainer/StudentProgress'))
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
const AdminStudentProgress    = lazy(() => import('./pages/admin/StudentProgress'))
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

          {/* Student */}
          <Route path="/student/dashboard" element={<PrivateRoute allowedRoles={['student']}><StudentDashboard /></PrivateRoute>} />
          <Route path="/student/modules"      element={<PrivateRoute allowedRoles={['student']}><StudentModules /></PrivateRoute>} />
          <Route path="/student/modules/:id" element={<PrivateRoute allowedRoles={['student']}><StudentModuleReader /></PrivateRoute>} />
          <Route path="/student/tests/:id" element={<PrivateRoute allowedRoles={['student']}><StudentTestTaker /></PrivateRoute>} />
          <Route path="/student/tests"     element={<Navigate to="/student/modules" replace />} />
          <Route path="/student/progress"  element={<PrivateRoute allowedRoles={['student']}><StudentProgress /></PrivateRoute>} />
          <Route path="/student/tests/:id/review" element={<PrivateRoute allowedRoles={['student']}><StudentTestReview /></PrivateRoute>} />
          <Route path="/student/submissions/:submissionId/review" element={<PrivateRoute allowedRoles={['student']}><StudentTestReview /></PrivateRoute>} />
          <Route path="/student/my-class"  element={<PrivateRoute allowedRoles={['student']}><StudentMyClass /></PrivateRoute>} />
          <Route path="/student/support"   element={<PrivateRoute allowedRoles={['student']}><StudentSupport /></PrivateRoute>} />
          <Route path="/student/profile"   element={<PrivateRoute allowedRoles={['student']}><StudentProfile /></PrivateRoute>} />

          {/* Trainer */}
          <Route path="/trainer/dashboard"    element={<PrivateRoute allowedRoles={['trainer']}><TrainerDashboard /></PrivateRoute>} />
          <Route path="/trainer/departments"      element={<PrivateRoute allowedRoles={['trainer']}><TrainerClasses /></PrivateRoute>} />
          <Route path="/trainer/departments/:id"  element={<PrivateRoute allowedRoles={['trainer']}><TrainerClassDetail /></PrivateRoute>} />
          <Route path="/trainer/progress"     element={<PrivateRoute allowedRoles={['trainer']}><TrainerProgress /></PrivateRoute>} />
          <Route path="/trainer/tests"        element={<Navigate to="/trainer/assignments" replace />} />
          <Route path="/trainer/assignments"  element={<PrivateRoute allowedRoles={['trainer']}><TrainerTestBuilder /></PrivateRoute>} />
          <Route path="/trainer/assignments/:testId/panels/:panelId/vr" element={<PrivateRoute allowedRoles={['trainer', 'admin']}><TrainerVRPanelEditor /></PrivateRoute>} />
          <Route path="/trainer/modules/:id"        element={<PrivateRoute allowedRoles={['trainer']}><TrainerModuleReader /></PrivateRoute>} />
          <Route path="/trainer/students/:studentId/progress" element={<PrivateRoute allowedRoles={['trainer']}><TrainerStudentProgress /></PrivateRoute>} />
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
          <Route path="/admin/students/:studentId/progress" element={<PrivateRoute allowedRoles={['admin']}><AdminStudentProgress /></PrivateRoute>} />
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
