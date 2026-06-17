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
const TeacherDashboard    = lazy(() => import('./pages/teacher/Dashboard'))
const TeacherClasses      = lazy(() => import('./pages/teacher/Departments'))
const TeacherClassDetail  = lazy(() => import('./pages/teacher/DepartmentDetail'))
const TeacherProgress     = lazy(() => import('./pages/teacher/Progress'))
const TeacherTestBuilder  = lazy(() => import('./pages/teacher/TestBuilder'))
const TeacherTests        = lazy(() => import('./pages/teacher/Tests'))
const TeacherVRPanelEditor= lazy(() => import('./pages/teacher/VRPanelEditor'))
const TeacherCourseBuilder    = lazy(() => import('./pages/teacher/CourseBuilder'))
const TeacherModulePanelEditor= lazy(() => import('./pages/teacher/ModulePanelEditor'))
const TeacherStudentProgress    = lazy(() => import('./pages/teacher/StudentProgress'))
const TeacherSubmissionOverview = lazy(() => import('./pages/teacher/SubmissionOverview'))
const TeacherTestSubmissions    = lazy(() => import('./pages/teacher/TestSubmissions'))
const TeacherModuleReader = lazy(() => import('./pages/teacher/ModuleReader'))
const TeacherMedia        = lazy(() => import('./pages/teacher/Media'))
const TeacherSupport      = lazy(() => import('./pages/teacher/Support'))
const TeacherProfile      = lazy(() => import('./pages/teacher/Profile'))
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
const AdminModulePanelEditor = lazy(() => import('./pages/teacher/ModulePanelEditor'))
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
          <Route path="/student/tests"     element={<PrivateRoute allowedRoles={['student']}><StudentTests /></PrivateRoute>} />
          <Route path="/student/progress"  element={<PrivateRoute allowedRoles={['student']}><StudentProgress /></PrivateRoute>} />
          <Route path="/student/tests/:id/review" element={<PrivateRoute allowedRoles={['student']}><StudentTestReview /></PrivateRoute>} />
          <Route path="/student/submissions/:submissionId/review" element={<PrivateRoute allowedRoles={['student']}><StudentTestReview /></PrivateRoute>} />
          <Route path="/student/my-class"  element={<PrivateRoute allowedRoles={['student']}><StudentMyClass /></PrivateRoute>} />
          <Route path="/student/support"   element={<PrivateRoute allowedRoles={['student']}><StudentSupport /></PrivateRoute>} />
          <Route path="/student/profile"   element={<PrivateRoute allowedRoles={['student']}><StudentProfile /></PrivateRoute>} />

          {/* Teacher */}
          <Route path="/teacher/dashboard"    element={<PrivateRoute allowedRoles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/departments"      element={<PrivateRoute allowedRoles={['teacher']}><TeacherClasses /></PrivateRoute>} />
          <Route path="/teacher/departments/:id"  element={<PrivateRoute allowedRoles={['teacher']}><TeacherClassDetail /></PrivateRoute>} />
          <Route path="/teacher/progress"     element={<PrivateRoute allowedRoles={['teacher']}><TeacherProgress /></PrivateRoute>} />
          <Route path="/teacher/tests"        element={<PrivateRoute allowedRoles={['teacher']}><TeacherTests /></PrivateRoute>} />
          <Route path="/teacher/assignments"  element={<PrivateRoute allowedRoles={['teacher']}><TeacherTestBuilder /></PrivateRoute>} />
          <Route path="/teacher/assignments/:testId/panels/:panelId/vr" element={<PrivateRoute allowedRoles={['teacher', 'admin']}><TeacherVRPanelEditor /></PrivateRoute>} />
          <Route path="/teacher/builder"             element={<PrivateRoute allowedRoles={['teacher']}><TeacherCourseBuilder /></PrivateRoute>} />
          <Route path="/teacher/modules/:id"        element={<PrivateRoute allowedRoles={['teacher']}><TeacherModuleReader /></PrivateRoute>} />
          <Route path="/teacher/modules/:id/panels" element={<PrivateRoute allowedRoles={['teacher']}><TeacherModulePanelEditor /></PrivateRoute>} />
          <Route path="/teacher/students/:studentId/progress" element={<PrivateRoute allowedRoles={['teacher']}><TeacherStudentProgress /></PrivateRoute>} />
          <Route path="/teacher/tests/:testId/submissions"    element={<PrivateRoute allowedRoles={['teacher']}><TeacherTestSubmissions /></PrivateRoute>} />
          <Route path="/teacher/submissions/:submissionId"   element={<PrivateRoute allowedRoles={['teacher']}><TeacherSubmissionOverview /></PrivateRoute>} />
          <Route path="/teacher/media"        element={<PrivateRoute allowedRoles={['teacher']}><TeacherMedia /></PrivateRoute>} />
          <Route path="/teacher/support"      element={<PrivateRoute allowedRoles={['teacher']}><TeacherSupport /></PrivateRoute>} />
          <Route path="/teacher/profile"      element={<PrivateRoute allowedRoles={['teacher']}><TeacherProfile /></PrivateRoute>} />

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
          <Route path="/admin/tests/:testId/panels/:panelId/vr" element={<PrivateRoute allowedRoles={['admin']}><TeacherVRPanelEditor /></PrivateRoute>} />
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
