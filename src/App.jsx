import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Login from './pages/Login'
import StudentDashboard from './pages/student/Dashboard'
import StudentLessons from './pages/student/Lessons'
import StudentTests    from './pages/student/Tests'
import StudentProgress from './pages/student/Progress'
import StudentMyClass  from './pages/student/MyClass'
import StudentSupport  from './pages/student/Support'
import StudentProfile  from './pages/student/Profile'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherClasses     from './pages/teacher/Classes'
import TeacherClassDetail  from './pages/teacher/ClassDetail'
import TeacherProgress      from './pages/teacher/Progress'
import TeacherTestBuilder   from './pages/teacher/TestBuilder'
import TeacherCourseBuilder from './pages/teacher/CourseBuilder'
import TeacherSupport       from './pages/teacher/Support'
import TeacherProfile      from './pages/teacher/Profile'
import AdminDashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/lessons" element={<StudentLessons />} />
          <Route path="/student/tests"    element={<StudentTests />} />
          <Route path="/student/progress" element={<StudentProgress />} />
          <Route path="/student/my-class"  element={<StudentMyClass />} />
          <Route path="/student/support"  element={<StudentSupport />} />
          <Route path="/student/profile"  element={<StudentProfile />} />
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/classes"          element={<TeacherClasses />} />
          <Route path="/teacher/classes/:id"    element={<TeacherClassDetail />} />
          <Route path="/teacher/progress"     element={<TeacherProgress />} />
          <Route path="/teacher/assignments"  element={<TeacherTestBuilder />} />
          <Route path="/teacher/builder"      element={<TeacherCourseBuilder />} />
          <Route path="/teacher/support"      element={<TeacherSupport />} />
          <Route path="/teacher/profile"      element={<TeacherProfile />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
