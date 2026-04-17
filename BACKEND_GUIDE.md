# SeaFarer Platform — Django Backend Implementation Guide

This document is derived from a full read of the frontend source. Every model field, route, and relationship is grounded in data the UI already uses or will need.

---

## 1. Project Setup

```
seafarer_backend/
├── manage.py
├── seafarer/               # project config (settings, urls, wsgi)
│   ├── settings.py
│   └── urls.py
├── apps/
│   ├── accounts/           # User model + auth
│   ├── classes/            # Classroom, Enrollment, Announcement
│   ├── lessons/            # Lesson, Course, ClassLesson, LessonProgress
│   ├── tests/              # Test, Question, Submission, Answer
│   ├── support/            # SupportTicket
│   └── progress/           # ActivityLog, Achievement, Certification
└── requirements.txt
```

**Key packages:**
```
django>=4.2
djangorestframework
djangorestframework-simplejwt   # JWT auth
django-cors-headers
django-filter                   # filtering querysets
Pillow                          # if profile photos are added later
```

**Auth strategy:** JWT via `djangorestframework-simplejwt`. The token payload must include `role` so the frontend can redirect to the correct dashboard on login.

---

## 2. Data Models

### 2.1 `accounts` app

#### `UserProfile` (OneToOne with Django's `User`)

| Field | Type | Notes |
|-------|------|-------|
| `role` | `CharField` | choices: `student`, `teacher`, `admin` |
| `student_id` | `CharField` | nullable; format `SF-YYYY-XXXX` |
| `nationality` | `CharField` | nullable |
| `date_of_birth` | `DateField` | nullable |
| `phone` | `CharField` | nullable |
| `institution` | `CharField` | nullable |
| `program` | `CharField` | nullable; e.g. "Officer Cadet – Deck" |
| `start_year` | `IntegerField` | nullable |
| `language` | `CharField` | default `"English"` |
| `timezone` | `CharField` | default `"UTC"` |
| `last_active` | `DateTimeField` | auto-updated on authenticated requests |
| `account_status` | `CharField` | choices: `active`, `suspended`; default `active` |
| `created_at` | `DateTimeField` | auto_now_add |

> Derive initials from `user.first_name[0] + user.last_name[0]` — no need to store them.

---

### 2.2 `classes` app

#### `Classroom`

| Field | Type | Notes |
|-------|------|-------|
| `name` | `CharField` | e.g. "Maritime Navigation 101" |
| `code` | `CharField` | unique; e.g. `MN-101` |
| `subject` | `CharField` | e.g. "Bridge Navigation" |
| `teacher` | `ForeignKey(User)` | `related_name='taught_classes'` |
| `semester` | `CharField` | e.g. "Spring 2026" |
| `start_date` | `DateField` | |
| `end_date` | `DateField` | |
| `status` | `CharField` | choices: `active`, `complete`, `archived`; default `active` |
| `created_at` | `DateTimeField` | auto_now_add |

#### `Enrollment`

| Field | Type | Notes |
|-------|------|-------|
| `student` | `ForeignKey(User)` | |
| `classroom` | `ForeignKey(Classroom)` | |
| `enrolled_at` | `DateTimeField` | auto_now_add |
| `status` | `CharField` | choices: `active`, `inactive`; default `active` |

`unique_together = ('student', 'classroom')`

#### `Announcement`

| Field | Type | Notes |
|-------|------|-------|
| `classroom` | `ForeignKey(Classroom)` | |
| `author` | `ForeignKey(User)` | teacher or admin |
| `title` | `CharField` | |
| `body` | `TextField` | |
| `pinned` | `BooleanField` | default `False` |
| `created_at` | `DateTimeField` | auto_now_add |

---

### 2.3 `lessons` app

#### `Lesson`

| Field | Type | Notes |
|-------|------|-------|
| `title` | `CharField` | |
| `category` | `CharField` | choices: `nav`, `emg`, `eng`, `cargo`, `comm` |
| `duration_minutes` | `IntegerField` | |
| `author` | `ForeignKey(User)` | teacher |
| `visibility` | `CharField` | choices: `class`, `public`; default `class` |
| `difficulty` | `CharField` | choices: `easy`, `intermediate`, `advanced` |
| `locked` | `BooleanField` | default `False`; teacher can lock/unlock per-class |
| `created_at` | `DateTimeField` | auto_now_add |

#### `ClassLesson` (M2M through table — lessons assigned to a class)

| Field | Type | Notes |
|-------|------|-------|
| `classroom` | `ForeignKey(Classroom)` | |
| `lesson` | `ForeignKey(Lesson)` | |
| `order` | `PositiveIntegerField` | display order in class |
| `locked` | `BooleanField` | overrides `Lesson.locked` for this class |
| `due_date` | `DateField` | nullable; deadline shown in MyClass/Tests |
| `assigned_at` | `DateTimeField` | auto_now_add |

`unique_together = ('classroom', 'lesson')`

#### `LessonProgress` (student ↔ lesson completion)

| Field | Type | Notes |
|-------|------|-------|
| `student` | `ForeignKey(User)` | |
| `lesson` | `ForeignKey(Lesson)` | |
| `completed` | `BooleanField` | default `False` |
| `completed_at` | `DateTimeField` | nullable |

`unique_together = ('student', 'lesson')`

#### `Course` (teacher's course builder — a curated, ordered playlist of lessons)

| Field | Type | Notes |
|-------|------|-------|
| `title` | `CharField` | |
| `description` | `CharField` | short blurb |
| `author` | `ForeignKey(User)` | teacher |
| `status` | `CharField` | choices: `draft`, `published`; default `draft` |
| `created_at` | `DateTimeField` | auto_now_add |

#### `CourseLesson` (M2M through table — ordered lessons in a course)

| Field | Type | Notes |
|-------|------|-------|
| `course` | `ForeignKey(Course)` | |
| `lesson` | `ForeignKey(Lesson)` | |
| `order` | `PositiveIntegerField` | |

`unique_together = ('course', 'lesson')`

---

### 2.4 `tests` app

#### `Test`

| Field | Type | Notes |
|-------|------|-------|
| `title` | `CharField` | |
| `author` | `ForeignKey(User)` | teacher |
| `classroom` | `ForeignKey(Classroom)` | nullable → open access test |
| `status` | `CharField` | choices: `draft`, `published`; default `draft` |
| `time_limit_minutes` | `IntegerField` | default `30` |
| `due_date` | `DateField` | nullable |
| `created_at` | `DateTimeField` | auto_now_add |

#### `Question`

| Field | Type | Notes |
|-------|------|-------|
| `test` | `ForeignKey(Test)` | `on_delete=CASCADE` |
| `type` | `CharField` | choices: `mcq`, `tf`, `short` |
| `text` | `TextField` | question body |
| `order` | `PositiveIntegerField` | |
| `correct_tf` | `BooleanField` | nullable; used when `type='tf'` |
| `correct_mcq_index` | `IntegerField` | nullable; 0-based index of correct option when `type='mcq'` |

> For `short` questions, correctness is teacher-graded — no stored answer.

#### `QuestionOption` (MCQ choices)

| Field | Type | Notes |
|-------|------|-------|
| `question` | `ForeignKey(Question)` | |
| `text` | `CharField` | |
| `order` | `PositiveIntegerField` | |

#### `TestSubmission`

| Field | Type | Notes |
|-------|------|-------|
| `test` | `ForeignKey(Test)` | |
| `student` | `ForeignKey(User)` | |
| `grade` | `FloatField` | nullable until graded |
| `submitted_at` | `DateTimeField` | auto_now_add |

`unique_together = ('test', 'student')` — one attempt per student (re-takes need teacher approval)

#### `Answer`

| Field | Type | Notes |
|-------|------|-------|
| `submission` | `ForeignKey(TestSubmission)` | |
| `question` | `ForeignKey(Question)` | |
| `text_answer` | `TextField` | nullable; for `short` questions |
| `selected_option` | `ForeignKey(QuestionOption)` | nullable; for `mcq` |
| `selected_tf` | `BooleanField` | nullable; for `tf` |
| `is_correct` | `BooleanField` | nullable; auto-set for `mcq`/`tf`, manual for `short` |

---

### 2.5 `support` app

#### `SupportTicket`

| Field | Type | Notes |
|-------|------|-------|
| `ticket_id` | `CharField` | auto-generated; format `TK-XXX` |
| `student` | `ForeignKey(User)` | |
| `subject` | `CharField` | |
| `category` | `CharField` | choices: `Technical`, `Access`, `Account`, `Hardware`, `Other` |
| `body` | `TextField` | |
| `status` | `CharField` | choices: `open`, `pending`, `resolved`; default `open` |
| `last_reply_by` | `CharField` | e.g. "Support Team" — denormalized for display |
| `created_at` | `DateTimeField` | auto_now_add |
| `updated_at` | `DateTimeField` | auto_now |

---

### 2.6 `progress` app

#### `ActivityLog`

| Field | Type | Notes |
|-------|------|-------|
| `student` | `ForeignKey(User)` | |
| `type` | `CharField` | choices: `lesson`, `test` |
| `description` | `CharField` | e.g. "Completed Fuel Management Systems" |
| `sub_info` | `CharField` | e.g. "Engine Room · 65 min" |
| `created_at` | `DateTimeField` | auto_now_add |

> Generate entries automatically via signals: one when `LessonProgress.completed` flips to `True`, another when `TestSubmission` is saved with a grade.

#### `Achievement`

| Field | Type | Notes |
|-------|------|-------|
| `student` | `ForeignKey(User)` | |
| `label` | `CharField` | e.g. "Perfect Score" |
| `icon` | `CharField` | choices: `book`, `star`, `flame`, `award`, `crown` |
| `earned_at` | `DateTimeField` | nullable; null = not yet earned |

> Unlock achievements via signals. Pre-populate the locked set when a user is created.

#### `Certification`

| Field | Type | Notes |
|-------|------|-------|
| `student` | `ForeignKey(User)` | |
| `name` | `CharField` | e.g. "STCW Basic Safety Training" |
| `issued_date` | `DateField` | nullable |
| `expiry_date` | `DateField` | nullable |
| `status` | `CharField` | choices: `valid`, `pending` |

---

## 3. API Routes

Base prefix: `/api/`

Use **DRF ViewSets + DefaultRouter** where CRUD is standard. Use `APIView` for custom actions.

### 3.1 Auth

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `POST` | `/api/auth/login/` | Returns `access`, `refresh`, `role`, `user_id` | Any |
| `POST` | `/api/auth/token/refresh/` | Refresh access token | Any |
| `POST` | `/api/auth/logout/` | Blacklist refresh token | Authenticated |
| `POST` | `/api/auth/change-password/` | `{current, new}` | Authenticated |

The login response shape the frontend needs:
```json
{
  "access": "...",
  "refresh": "...",
  "role": "student",
  "user_id": 42
}
```

### 3.2 Current User (Profile)

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/users/me/` | Full profile | Authenticated |
| `PATCH` | `/api/users/me/` | Update editable fields | Authenticated |
| `DELETE` | `/api/users/me/` | Delete account (danger zone) | Authenticated |

### 3.3 Classes

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/classes/` | Teacher: their classes. Student: enrolled classes | Auth |
| `POST` | `/api/classes/` | Create new class | Teacher |
| `GET` | `/api/classes/{id}/` | Detail + stats | Auth |
| `PATCH` | `/api/classes/{id}/` | Edit name, code, status, etc. | Teacher |
| `DELETE` | `/api/classes/{id}/` | Archive or hard-delete | Teacher/Admin |
| `GET` | `/api/classes/{id}/students/` | Roster with progress + last_active | Teacher |
| `POST` | `/api/classes/{id}/students/` | Enroll student by `student_id` or email | Teacher |
| `DELETE` | `/api/classes/{id}/students/{uid}/` | Remove student | Teacher |
| `GET` | `/api/classes/{id}/lessons/` | Lessons assigned to this class + completion stats | Auth |
| `POST` | `/api/classes/{id}/lessons/` | Assign a lesson to the class | Teacher |
| `PATCH` | `/api/classes/{id}/lessons/{lid}/` | Update order, locked, due_date | Teacher |
| `DELETE` | `/api/classes/{id}/lessons/{lid}/` | Unassign lesson | Teacher |
| `GET` | `/api/classes/{id}/assignments/` | Tests linked to this class + submission stats | Auth |
| `POST` | `/api/classes/{id}/announcements/` | Post announcement | Teacher |
| `GET` | `/api/classes/{id}/announcements/` | List announcements (student: their class) | Auth |
| `PATCH` | `/api/classes/{id}/announcements/{aid}/` | Edit / pin / unpin | Teacher |
| `DELETE` | `/api/classes/{id}/announcements/{aid}/` | Delete | Teacher |

### 3.4 Lessons

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/lessons/` | Lesson bank. Student sees class + public lessons. Teacher sees all theirs. Supports `?category=`, `?difficulty=`, `?visibility=`, `?author=`, `?search=` | Auth |
| `POST` | `/api/lessons/` | Create lesson | Teacher |
| `GET` | `/api/lessons/{id}/` | Detail | Auth |
| `PATCH` | `/api/lessons/{id}/` | Edit | Teacher (own lessons) |
| `DELETE` | `/api/lessons/{id}/` | Delete | Teacher (own) / Admin |
| `POST` | `/api/lessons/{id}/complete/` | Mark as complete for current student | Student |
| `DELETE` | `/api/lessons/{id}/complete/` | Unmark complete | Student |

### 3.5 Courses (Teacher's Course Builder)

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/courses/` | Teacher's own courses | Teacher |
| `POST` | `/api/courses/` | Create | Teacher |
| `GET` | `/api/courses/{id}/` | Detail with ordered lessons | Teacher |
| `PATCH` | `/api/courses/{id}/` | Edit title, description, status | Teacher |
| `DELETE` | `/api/courses/{id}/` | Delete | Teacher |
| `POST` | `/api/courses/{id}/lessons/` | Add lesson to course | Teacher |
| `DELETE` | `/api/courses/{id}/lessons/{lid}/` | Remove from course | Teacher |
| `POST` | `/api/courses/{id}/lessons/reorder/` | `{lesson_id, new_order}` | Teacher |

### 3.6 Tests

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/tests/` | Teacher: their tests. Student: available tests (class + open). Supports `?class=`, `?status=`, `?search=` | Auth |
| `POST` | `/api/tests/` | Create | Teacher |
| `GET` | `/api/tests/{id}/` | Detail. Student sees questions without correct answers | Auth |
| `PATCH` | `/api/tests/{id}/` | Edit title, class, time_limit, due_date | Teacher |
| `DELETE` | `/api/tests/{id}/` | Delete | Teacher |
| `POST` | `/api/tests/{id}/publish/` | Toggle draft ↔ published | Teacher |
| `GET` | `/api/tests/{id}/questions/` | List questions (teacher sees correct answers) | Teacher |
| `POST` | `/api/tests/{id}/questions/` | Add question | Teacher |
| `PATCH` | `/api/tests/{id}/questions/{qid}/` | Edit question/options | Teacher |
| `DELETE` | `/api/tests/{id}/questions/{qid}/` | Remove | Teacher |

### 3.7 Test Submissions

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `POST` | `/api/tests/{id}/submit/` | Submit answers; auto-grade mcq/tf, leave short as null | Student |
| `GET` | `/api/tests/{id}/submission/` | Student's own submission + grade | Student |
| `GET` | `/api/tests/{id}/submissions/` | All submissions for a test | Teacher |
| `PATCH` | `/api/tests/{id}/submissions/{sid}/` | Grade short-answer questions | Teacher |

### 3.8 Student Progress

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/progress/` | Summary stats: lessons done, avg grade, hours, streak, module breakdown | Student |
| `GET` | `/api/progress/activity/` | Recent activity feed (lesson + test events) | Student |
| `GET` | `/api/progress/test-results/` | All graded test submissions | Student |

### 3.9 Teacher Progress

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/teacher/progress/` | All students across teacher's classes. Supports `?class=`, `?status=at-risk\|on-track\|complete`, `?search=`, `?sort=` | Teacher |

The `status` field is computed:
- `complete` → all lessons done
- `at-risk` → less than 30% done, or last_active > 7 days ago
- `on-track` → everything else

### 3.10 Support Tickets

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/support/tickets/` | Student: own tickets. Admin: all tickets. Supports `?status=` | Auth |
| `POST` | `/api/support/tickets/` | Submit ticket | Student |
| `GET` | `/api/support/tickets/{id}/` | Detail | Auth (own or admin) |
| `PATCH` | `/api/support/tickets/{id}/` | Update status, last_reply_by | Admin |

### 3.11 Achievements

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/achievements/` | Student's achievement set (earned + locked) | Student |

### 3.12 Certifications

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/certifications/` | Student's certifications | Student |
| `POST` | `/api/certifications/` | Create cert record | Admin |
| `PATCH` | `/api/certifications/{id}/` | Update status, dates | Admin |

### 3.13 Admin

| Method | URL | Description | Role |
|--------|-----|-------------|------|
| `GET` | `/api/admin/users/` | All users. Supports `?role=`, `?search=` | Admin |
| `POST` | `/api/admin/users/` | Create user | Admin |
| `PATCH` | `/api/admin/users/{id}/` | Edit role, status | Admin |
| `DELETE` | `/api/admin/users/{id}/` | Delete | Admin |
| `GET` | `/api/admin/analytics/` | Platform-wide stats: total users, classes, active students, avg scores | Admin |

---

## 4. Permissions Design

Use DRF's permission classes. Define three custom base classes:

```python
IsStudent    # request.user.userprofile.role == 'student'
IsTeacher    # request.user.userprofile.role == 'teacher'
IsAdmin      # request.user.userprofile.role == 'admin'
```

For ownership checks (teacher can only edit their own class/lesson/test), implement object-level permissions:

```python
class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.userprofile.role == 'admin':
            return True
        return obj.teacher == request.user  # or obj.author
```

---

## 5. Serializers — Key Shapes

### Login response
```json
{ "access": "...", "refresh": "...", "role": "student", "user_id": 1 }
```

### GET `/api/users/me/` (student)
```json
{
  "id": 1, "username": "alex.mercer", "first_name": "Alex", "last_name": "Mercer",
  "email": "alex.mercer@seafarer.academy",
  "profile": {
    "role": "student", "student_id": "SF-2026-0142", "nationality": "Canadian",
    "date_of_birth": "2001-08-17", "phone": "+1 604 555 0198",
    "institution": "Pacific Maritime Institute", "program": "Officer Cadet – Deck",
    "start_year": 2025, "language": "English", "timezone": "America/Vancouver",
    "last_active": "2026-03-29T09:14:00Z", "account_status": "active"
  }
}
```

### GET `/api/lessons/` (student)
```json
[
  {
    "id": 1, "title": "Helm Control Basics", "category": "nav",
    "duration_minutes": 45, "author": "Capt. Rodriguez",
    "visibility": "class", "difficulty": "easy",
    "locked": false, "completed": true
  }
]
```
> `completed` is annotated per-student — do not store on the `Lesson` model itself.

### GET `/api/tests/` (student)
```json
[
  {
    "id": 1, "title": "Bridge Navigation Fundamentals",
    "author": "Capt. Rodriguez", "class_name": "Maritime Nav 101",
    "class_id": "nav", "due_date": "2026-04-01",
    "completed": false, "grade": null
  }
]
```

### GET `/api/progress/` (student)
```json
{
  "lessons_complete": 5, "lessons_total": 12,
  "avg_grade": 72, "tests_taken": 5,
  "hours_trained": 5.9, "active_streak_days": 3,
  "modules": [
    { "id": "nav", "label": "Bridge Navigation", "total": 4, "done": 2, "hours": 2.5 }
  ]
}
```

---

## 6. Computed / Aggregated Fields

These are never stored — compute them in the serializer or view:

| Field | Where | How |
|-------|-------|-----|
| `hours_trained` | Student progress | Sum `duration_minutes` of completed lessons ÷ 60 |
| `active_streak_days` | Student progress | Count consecutive days with at least one `ActivityLog` entry going back from today |
| `avg_grade` | Student / class | `Avg('grade')` on graded `TestSubmission` |
| `class_rank` | MyClass page | Count students with higher `lessons_done` in the same class |
| `student status` (at-risk etc.) | Teacher progress | Computed from `lessons_done / lessons_total` ratio + `last_active` |
| `lesson completion %` | ClassDetail | `completed / total` across all enrolled students per lesson |

---

## 7. Signals to Wire Up

```python
# lessons/signals.py
@receiver(post_save, sender=LessonProgress)
def on_lesson_complete(sender, instance, **kwargs):
    if instance.completed:
        ActivityLog.objects.create(
            student=instance.student, type='lesson',
            description=f'Completed {instance.lesson.title}',
            sub_info=f'{instance.lesson.get_category_display()} · {instance.lesson.duration_minutes} min'
        )
        check_and_award_achievements(instance.student)

# tests/signals.py
@receiver(post_save, sender=TestSubmission)
def on_test_graded(sender, instance, **kwargs):
    if instance.grade is not None:
        ActivityLog.objects.create(
            student=instance.student, type='test',
            description=f'Scored {instance.grade:.0f}% on {instance.test.title}',
            sub_info=f'By {instance.test.author.get_full_name()}'
        )
        check_and_award_achievements(instance.student)
```

---

## 8. Auto-grading Logic

When a `TestSubmission` is created (student submits):

1. For each `Answer` where `question.type == 'mcq'`:  
   `is_correct = (answer.selected_option.order == question.correct_mcq_index)`

2. For each `Answer` where `question.type == 'tf'`:  
   `is_correct = (answer.selected_tf == question.correct_tf)`

3. For each `Answer` where `question.type == 'short'`:  
   `is_correct = None` — teacher grades manually via `PATCH /api/tests/{id}/submissions/{sid}/`

4. Final grade = `(correct_count / auto_gradeable_count) * 100`  
   If there are `short` questions, grade stays `null` until teacher submits their marks.

---

## 9. Ticket ID Generation

```python
class SupportTicket(models.Model):
    ticket_id = models.CharField(max_length=20, unique=True, editable=False)

    def save(self, *args, **kwargs):
        if not self.ticket_id:
            last = SupportTicket.objects.order_by('id').last()
            num  = (last.id + 1) if last else 1
            self.ticket_id = f'TK-{num:03d}'
        super().save(*args, **kwargs)
```

---

## 10. CORS & Frontend Integration

In `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev server
]
CORS_ALLOW_CREDENTIALS = True
```

The frontend `AuthContext` currently uses a mock `login(username, role)`. Replace it with:
```js
const login = async (username, password) => {
  const res = await fetch('/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await res.json()
  // store data.access in memory / data.refresh in httpOnly cookie
  setUser({ username, role: data.role, id: data.user_id })
}
```

Store the access token in memory (not localStorage) and the refresh token in an `httpOnly` cookie to avoid XSS exposure. Set up a request interceptor that automatically attaches `Authorization: Bearer <token>` to every API call.

---

## 11. Implementation Order

Start with the models and auth — everything else depends on them.

1. `accounts` — User + UserProfile, login/logout/change-password
2. `classes` — Classroom, Enrollment
3. `lessons` — Lesson, ClassLesson, LessonProgress
4. `tests` — Test, Question, QuestionOption, TestSubmission, Answer
5. `progress` — ActivityLog, Achievement, Certification (wire signals)
6. `support` — SupportTicket
7. `courses` — Course, CourseLesson (teacher builder)
8. Admin analytics endpoint last — it is read-only aggregation over existing tables

---

## 12. Quick Reference — Role Access Matrix

| Resource | Student | Teacher | Admin |
|----------|---------|---------|-------|
| Own profile | R/W | R/W | R/W |
| All users | — | — | R/W |
| Classroom (own/enrolled) | R | R/W | R/W |
| Lesson bank | R (class+public) | R/W (own) | R/W |
| LessonProgress | R/W (own) | R (students') | R |
| Course builder | — | R/W (own) | R |
| Test (submit) | R + submit | R/W (own) | R/W |
| Test (grade) | — | W | W |
| Support tickets | R/W (own) | — | R/W |
| Certifications | R | — | R/W |
| Achievements | R | — | R/W |
| Admin analytics | — | — | R |
