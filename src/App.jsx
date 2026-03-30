import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { TransitionProvider } from './context/TransitionContext'

const Landing             = lazy(() => import('./pages/Landing'))
const Login               = lazy(() => import('./pages/Login'))
const StudentDashboard    = lazy(() => import('./pages/student/Dashboard'))
const StudentLessons      = lazy(() => import('./pages/student/Lessons'))
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
const TeacherCourseBuilder= lazy(() => import('./pages/teacher/CourseBuilder'))
const TeacherSupport      = lazy(() => import('./pages/teacher/Support'))
const TeacherProfile      = lazy(() => import('./pages/teacher/Profile'))
const AdminDashboard      = lazy(() => import('./pages/admin/Dashboard'))

function PageShell() {
  return (
    <TransitionProvider>
      <Suspense fallback={<div className="page-suspense-fallback" />}>
        <Routes>
          <Route path="/landing"                element={<Landing />} />
          <Route path="/"                       element={<Login />} />
          <Route path="/student/dashboard"      element={<StudentDashboard />} />
          <Route path="/student/lessons"        element={<StudentLessons />} />
          <Route path="/student/tests"          element={<StudentTests />} />
          <Route path="/student/progress"       element={<StudentProgress />} />
          <Route path="/student/my-class"       element={<StudentMyClass />} />
          <Route path="/student/support"        element={<StudentSupport />} />
          <Route path="/student/profile"        element={<StudentProfile />} />
          <Route path="/teacher/dashboard"      element={<TeacherDashboard />} />
          <Route path="/teacher/classes"        element={<TeacherClasses />} />
          <Route path="/teacher/classes/:id"    element={<TeacherClassDetail />} />
          <Route path="/teacher/progress"       element={<TeacherProgress />} />
          <Route path="/teacher/assignments"    element={<TeacherTestBuilder />} />
          <Route path="/teacher/builder"        element={<TeacherCourseBuilder />} />
          <Route path="/teacher/support"        element={<TeacherSupport />} />
          <Route path="/teacher/profile"        element={<TeacherProfile />} />
          <Route path="/admin/dashboard"        element={<AdminDashboard />} />
          <Route path="*"                       element={<Navigate to="/" replace />} />
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
