import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { TransitionProvider } from './context/TransitionContext'
import PrivateRoute from './components/shared/PrivateRoute'

const Landing             = lazy(() => import('./pages/Landing'))
const Login               = lazy(() => import('./pages/Login'))
const VRDemo              = lazy(() => import('./pages/VRDemo'))
const StudentDashboard    = lazy(() => import('./pages/student/Dashboard'))
const StudentLessons      = lazy(() => import('./pages/student/Lessons'))
const StudentLessonReader = lazy(() => import('./pages/student/LessonReader'))
const StudentTests        = lazy(() => import('./pages/student/Tests'))
const StudentProgress     = lazy(() => import('./pages/student/Progress'))
const StudentMyClass      = lazy(() => import('./pages/student/MyClass'))
const StudentSupport      = lazy(() => import('./pages/student/Support'))
const StudentProfile      = lazy(() => import('./pages/student/Profile'))
const TeacherDashboard    = lazy(() => import('./pages/teacher/Dashboard'))
const TeacherClasses      = lazy(() => import('./pages/teacher/Classes'))
const TeacherClassDetail  = lazy(() => import('./pages/teacher/ClassDetail'))
const TeacherProgress     = lazy(() => import('./pages/teacher/Progress'))
const TeacherTestBuilder  = lazy(() => import('./pages/teacher/TestBuilder'))
const TeacherCourseBuilder    = lazy(() => import('./pages/teacher/CourseBuilder'))
const TeacherLessonPanelEditor= lazy(() => import('./pages/teacher/LessonPanelEditor'))
const TeacherSupport      = lazy(() => import('./pages/teacher/Support'))
const TeacherProfile      = lazy(() => import('./pages/teacher/Profile'))
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'))
const AdminUsers          = lazy(() => import('./pages/admin/Users'))
const AdminLessons        = lazy(() => import('./pages/admin/Lessons'))
const AdminClasses        = lazy(() => import('./pages/admin/Classes'))
const AdminClassDetail    = lazy(() => import('./pages/admin/ClassDetail'))

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
          <Route path="/student/lessons"      element={<PrivateRoute allowedRoles={['student']}><StudentLessons /></PrivateRoute>} />
          <Route path="/student/lessons/:id" element={<PrivateRoute allowedRoles={['student']}><StudentLessonReader /></PrivateRoute>} />
          <Route path="/student/tests"     element={<PrivateRoute allowedRoles={['student']}><StudentTests /></PrivateRoute>} />
          <Route path="/student/progress"  element={<PrivateRoute allowedRoles={['student']}><StudentProgress /></PrivateRoute>} />
          <Route path="/student/my-class"  element={<PrivateRoute allowedRoles={['student']}><StudentMyClass /></PrivateRoute>} />
          <Route path="/student/support"   element={<PrivateRoute allowedRoles={['student']}><StudentSupport /></PrivateRoute>} />
          <Route path="/student/profile"   element={<PrivateRoute allowedRoles={['student']}><StudentProfile /></PrivateRoute>} />

          {/* Teacher */}
          <Route path="/teacher/dashboard"    element={<PrivateRoute allowedRoles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/classes"      element={<PrivateRoute allowedRoles={['teacher']}><TeacherClasses /></PrivateRoute>} />
          <Route path="/teacher/classes/:id"  element={<PrivateRoute allowedRoles={['teacher']}><TeacherClassDetail /></PrivateRoute>} />
          <Route path="/teacher/progress"     element={<PrivateRoute allowedRoles={['teacher']}><TeacherProgress /></PrivateRoute>} />
          <Route path="/teacher/assignments"  element={<PrivateRoute allowedRoles={['teacher']}><TeacherTestBuilder /></PrivateRoute>} />
          <Route path="/teacher/builder"             element={<PrivateRoute allowedRoles={['teacher']}><TeacherCourseBuilder /></PrivateRoute>} />
          <Route path="/teacher/lessons/:id/panels" element={<PrivateRoute allowedRoles={['teacher']}><TeacherLessonPanelEditor /></PrivateRoute>} />
          <Route path="/teacher/support"      element={<PrivateRoute allowedRoles={['teacher']}><TeacherSupport /></PrivateRoute>} />
          <Route path="/teacher/profile"      element={<PrivateRoute allowedRoles={['teacher']}><TeacherProfile /></PrivateRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard"      element={<PrivateRoute allowedRoles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/users"          element={<PrivateRoute allowedRoles={['admin']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/lessons"        element={<PrivateRoute allowedRoles={['admin']}><AdminLessons /></PrivateRoute>} />
          <Route path="/admin/classes"        element={<PrivateRoute allowedRoles={['admin']}><AdminClasses /></PrivateRoute>} />
          <Route path="/admin/classes/:id"    element={<PrivateRoute allowedRoles={['admin']}><AdminClassDetail /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </TransitionProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PageShell />
      </BrowserRouter>
    </AuthProvider>
  )
}
