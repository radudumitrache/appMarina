# Frontend → Backend Integration Guide

This guide is written specifically for the SeaFarer React/Vite frontend connecting to this Django backend.

---

## 1. Start the backend

```bash
cd seafarer_backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # creates your first admin account
python manage.py runserver         # runs on http://localhost:8000
```

The API is now live at `http://localhost:8000/api/`.  
The Django admin is at `http://localhost:8000/admin/`.

---

## 2. Install axios in your React project

```bash
npm install axios
```

---

## 3. Environment variable

Create a `.env` file in the **root of your React project** (next to `package.json`):

```
VITE_API_BASE_URL=http://localhost:8000/api
```

> Vite exposes only variables prefixed with `VITE_`. Never put secrets here.

---

## 4. Axios instance

Create `src/api/axios.js`:

```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,            // sends the httpOnly refresh-token cookie
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach access token ─────────────────────────────
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token'); // stored in memory/sessionStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — auto-refresh on 401 ───────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // The refresh token lives in an httpOnly cookie — just POST, no body needed
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );
        sessionStorage.setItem('access_token', data.access);
        processQueue(null, data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        sessionStorage.removeItem('access_token');
        window.location.href = '/login';   // redirect to login on refresh failure
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 5. Auth context

Replace your mock `AuthContext` with the real one.  
Create or overwrite `src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { id, username, role }
  const [loading, setLoading] = useState(true); // true while checking existing session

  // On app load: try to restore session with a token refresh
  useEffect(() => {
    api.post('/auth/token/refresh/', {}, { withCredentials: true })
      .then(({ data }) => {
        sessionStorage.setItem('access_token', data.access);
        return api.get('/users/me/');
      })
      .then(({ data }) => {
        setUser({ id: data.id, username: data.username, role: data.profile.role });
      })
      .catch(() => {
        // No valid session — stay logged out
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password });
    // data = { access, refresh, role, user_id }
    sessionStorage.setItem('access_token', data.access);
    // The refresh token is set as httpOnly cookie by the backend automatically
    setUser({ id: data.user_id, username, role: data.role });
    return data.role; // so the caller can redirect to the right dashboard
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/', {
        refresh: null, // backend reads the cookie; body not required
      });
    } catch (_) { /* ignore */ }
    sessionStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

Wrap your app in `src/main.jsx`:

```jsx
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
```

---

## 6. Protecting routes

```jsx
// src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
```

Usage in your router:

```jsx
<Route path="/student/*" element={
  <PrivateRoute allowedRoles={['student']}>
    <StudentDashboard />
  </PrivateRoute>
} />

<Route path="/teacher/*" element={
  <PrivateRoute allowedRoles={['teacher']}>
    <TeacherDashboard />
  </PrivateRoute>
} />

<Route path="/admin/*" element={
  <PrivateRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </PrivateRoute>
} />
```

---

## 7. API service modules

Create one file per domain in `src/api/`.

### `src/api/auth.js`
```js
import api from './axios';

export const login     = (username, password) => api.post('/auth/login/', { username, password });
export const logout    = ()                   => api.post('/auth/logout/');
export const changePassword = (current, next) => api.post('/auth/change-password/', { current, new: next });
```

### `src/api/users.js`
```js
import api from './axios';

export const getMe    = ()       => api.get('/users/me/');
export const updateMe = (data)   => api.patch('/users/me/', data);
export const deleteMe = ()       => api.delete('/users/me/');
```

### `src/api/classes.js`
```js
import api from './axios';

export const getClasses              = ()               => api.get('/classes/');
export const createClass             = (data)           => api.post('/classes/', data);
export const getClass                = (id)             => api.get(`/classes/${id}/`);
export const updateClass             = (id, data)       => api.patch(`/classes/${id}/`, data);
export const deleteClass             = (id)             => api.delete(`/classes/${id}/`);

export const getClassStudents        = (id)             => api.get(`/classes/${id}/students/`);
export const enrollStudent           = (id, identifier) => api.post(`/classes/${id}/students/`, identifier);
export const removeStudent           = (id, uid)        => api.delete(`/classes/${id}/students/${uid}/`);

export const getClassLessons         = (id)             => api.get(`/classes/${id}/lessons/`);
export const assignLesson            = (id, data)       => api.post(`/classes/${id}/lessons/`, data);
export const updateClassLesson       = (id, lid, data)  => api.patch(`/classes/${id}/lessons/${lid}/`, data);
export const unassignLesson          = (id, lid)        => api.delete(`/classes/${id}/lessons/${lid}/`);

export const getClassAssignments     = (id)             => api.get(`/classes/${id}/assignments/`);

export const getAnnouncements        = (id)             => api.get(`/classes/${id}/announcements/`);
export const createAnnouncement      = (id, data)       => api.post(`/classes/${id}/announcements/`, data);
export const updateAnnouncement      = (id, aid, data)  => api.patch(`/classes/${id}/announcements/${aid}/`, data);
export const deleteAnnouncement      = (id, aid)        => api.delete(`/classes/${id}/announcements/${aid}/`);
```

### `src/api/lessons.js`
```js
import api from './axios';

export const getLessons    = (params) => api.get('/lessons/', { params });
export const createLesson  = (data)   => api.post('/lessons/', data);
export const getLesson     = (id)     => api.get(`/lessons/${id}/`);
export const updateLesson  = (id, data) => api.patch(`/lessons/${id}/`, data);
export const deleteLesson  = (id)     => api.delete(`/lessons/${id}/`);
export const completeLesson   = (id)  => api.post(`/lessons/${id}/complete/`);
export const uncompleteLesson = (id)  => api.delete(`/lessons/${id}/complete/`);

// Courses
export const getCourses    = ()       => api.get('/courses/');
export const createCourse  = (data)   => api.post('/courses/', data);
export const getCourse     = (id)     => api.get(`/courses/${id}/`);
export const updateCourse  = (id, d)  => api.patch(`/courses/${id}/`, d);
export const deleteCourse  = (id)     => api.delete(`/courses/${id}/`);
export const addCourseLesson    = (id, data)      => api.post(`/courses/${id}/lessons/`, data);
export const removeCourseLesson = (id, lid)       => api.delete(`/courses/${id}/lessons/${lid}/`);
export const reorderCourseLesson = (id, data)     => api.post(`/courses/${id}/lessons/reorder/`, data);
```

### `src/api/tests.js`
```js
import api from './axios';

export const getTests       = (params)      => api.get('/tests/', { params });
export const createTest     = (data)        => api.post('/tests/', data);
export const getTest        = (id)          => api.get(`/tests/${id}/`);
export const updateTest     = (id, data)    => api.patch(`/tests/${id}/`, data);
export const deleteTest     = (id)          => api.delete(`/tests/${id}/`);
export const publishTest    = (id)          => api.post(`/tests/${id}/publish/`);

export const getQuestions   = (id)          => api.get(`/tests/${id}/questions/`);
export const addQuestion    = (id, data)    => api.post(`/tests/${id}/questions/`, data);
export const updateQuestion = (id, qid, d)  => api.patch(`/tests/${id}/questions/${qid}/`, d);
export const deleteQuestion = (id, qid)     => api.delete(`/tests/${id}/questions/${qid}/`);

export const submitTest         = (id, answers) => api.post(`/tests/${id}/submit/`, { answers });
export const getMySubmission    = (id)           => api.get(`/tests/${id}/submission/`);
export const getAllSubmissions   = (id)           => api.get(`/tests/${id}/submissions/`);
export const gradeSubmission    = (id, sid, data) => api.patch(`/tests/${id}/submissions/${sid}/`, data);
```

### `src/api/progress.js`
```js
import api from './axios';

export const getProgress         = ()  => api.get('/progress/');
export const getActivity         = ()  => api.get('/progress/activity/');
export const getTestResults      = ()  => api.get('/progress/test-results/');
export const getTeacherProgress  = (params) => api.get('/teacher/progress/', { params });
export const getAchievements     = ()  => api.get('/achievements/');
export const getCertifications   = ()  => api.get('/certifications/');
```

### `src/api/support.js`
```js
import api from './axios';

export const getTickets   = (params) => api.get('/support/tickets/', { params });
export const createTicket = (data)   => api.post('/support/tickets/', data);
export const getTicket    = (id)     => api.get(`/support/tickets/${id}/`);
export const updateTicket = (id, d)  => api.patch(`/support/tickets/${id}/`, d);
```

### `src/api/admin.js`
```js
import api from './axios';

export const getUsers     = (params) => api.get('/admin/users/', { params });
export const createUser   = (data)   => api.post('/admin/users/', data);
export const updateUser   = (id, d)  => api.patch(`/admin/users/${id}/`, d);
export const deleteUser   = (id)     => api.delete(`/admin/users/${id}/`);
export const getAnalytics = ()       => api.get('/admin/analytics/');
```

---

## 8. Usage examples in components

### Login page
```jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = Object.fromEntries(new FormData(e.target));
    const role = await login(username, password);
    navigate(role === 'teacher' ? '/teacher' : role === 'admin' ? '/admin' : '/student');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Log in</button>
    </form>
  );
}
```

### Fetching data with useEffect
```jsx
import { useEffect, useState } from 'react';
import { getProgress } from '../api/progress';

export default function ProgressPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getProgress().then(({ data }) => setData(data));
  }, []);

  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <p>Lessons complete: {data.lessons_complete} / {data.lessons_total}</p>
      <p>Average grade: {data.avg_grade}%</p>
      <p>Hours trained: {data.hours_trained}</p>
      <p>Streak: {data.active_streak_days} days</p>
    </div>
  );
}
```

### Completing a lesson
```jsx
import { completeLesson } from '../api/lessons';

async function handleComplete(lessonId) {
  await completeLesson(lessonId);
  // update local state to reflect the change
}
```

### Submitting a test
```jsx
import { submitTest } from '../api/tests';

const answers = [
  { question: 1, selected_option: 3 },         // MCQ
  { question: 2, selected_tf: true },           // T/F
  { question: 3, text_answer: 'Port side' },    // Short answer
];

const { data } = await submitTest(testId, answers);
console.log(data.grade); // null if short answers pending teacher grading
```

---

## 9. CORS — what's already configured

The backend `settings.py` already allows:

```
http://localhost:5173    ← Vite default port
http://localhost:3000
```

If your Vite dev server runs on a different port, open `seafarer_backend/seafarer/settings.py` and add it to `CORS_ALLOWED_ORIGINS`.

---

## 10. httpOnly cookie for the refresh token

The `djangorestframework-simplejwt` library does **not** automatically set the refresh token as a cookie — it returns it in the JSON body. You have two options:

**Option A (quick start):** store the refresh token in `sessionStorage` alongside the access token. Less secure but gets you running immediately.

**Option B (recommended):** install `djangorestframework-simplejwt[crypto]` and add a custom login view that moves the refresh token into a `Set-Cookie` header. Update `accounts/views.py` `LoginView.post()`:

```python
from rest_framework.response import Response

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.pop('refresh', None)
        if refresh:
            response.set_cookie(
                key='refresh_token',
                value=refresh,
                httponly=True,
                secure=False,     # set True in production (HTTPS only)
                samesite='Lax',
                max_age=7 * 24 * 60 * 60,  # 7 days
            )
        return response
```

Then update the `TokenRefreshView` to read the cookie. Add to `accounts/views.py`:

```python
from rest_framework_simplejwt.views import TokenRefreshView as BaseRefreshView
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

class CookieTokenRefreshView(BaseRefreshView):
    def post(self, request, *args, **kwargs):
        refresh = request.COOKIES.get('refresh_token')
        if not refresh:
            return Response({'detail': 'No refresh token.'}, status=400)
        request.data._mutable = True
        request.data['refresh'] = refresh
        request.data._mutable = False
        return super().post(request, *args, **kwargs)
```

And update `accounts/urls.py`:

```python
path('auth/token/refresh/', CookieTokenRefreshView.as_view(), name='token-refresh'),
```

---

## 11. File structure summary

After following this guide your React `src/` should look like:

```
src/
├── api/
│   ├── axios.js        ← single axios instance with interceptors
│   ├── auth.js
│   ├── users.js
│   ├── classes.js
│   ├── lessons.js
│   ├── tests.js
│   ├── progress.js
│   ├── support.js
│   └── admin.js
├── context/
│   └── AuthContext.jsx ← real login/logout, session restore on reload
└── components/
    └── PrivateRoute.jsx
```

---

## 12. Quick checklist before going live

- [ ] Backend running on `http://localhost:8000`
- [ ] `.env` file created with `VITE_API_BASE_URL`
- [ ] `AuthProvider` wraps the app in `main.jsx`
- [ ] Mock `login(username, role)` in old `AuthContext` replaced
- [ ] All protected pages wrapped in `<PrivateRoute>`
- [ ] CORS origin matches your actual Vite port
- [ ] At least one user of each role created via Django admin (`/admin/`)
