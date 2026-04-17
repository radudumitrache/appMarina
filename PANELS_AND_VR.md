# Panels & VR Tour System

Each `Lesson` is composed of an ordered list of **Panels**. A panel is either a block of text or an immersive VR tour. VR tours contain spatial **Anchors** — interactive hotspots placed at specific 3-D coordinates inside the scene.

---

## Data model

```
Lesson
└── Panel  (ordered, type = "text" | "vr_tour")
    ├── TextPanel          ← exists when type = "text"
    └── VRTour             ← exists when type = "vr_tour"
        ├── TextAnchor[]       position + title + description
        └── NavigatorAnchor[]  position + target_vr_tour (FK → VRTour)
```

### Panel

| Field | Type | Notes |
|---|---|---|
| `id` | int | |
| `lesson` | FK Lesson | |
| `type` | `"text"` \| `"vr_tour"` | Determines which nested object is populated |
| `order` | int | Ascending, controls display sequence |
| `title` | string | Shown as the panel heading |

### TextPanel

Attached 1-to-1 to a Panel of type `text`.

| Field | Type |
|---|---|
| `body` | text |

### VRTour

Attached 1-to-1 to a Panel of type `vr_tour`.

| Field | Type | Notes |
|---|---|---|
| `scene_url` | URL | Path to the 360/equirectangular scene image |

### Anchor base (abstract)

All anchor types share these position fields.

| Field | Type | Notes |
|---|---|---|
| `pos_x` | float | metres, right-handed coordinate system |
| `pos_y` | float | height |
| `pos_z` | float | depth |

### TextAnchor

Displays an info card when the user looks at / clicks the anchor.

| Field | Type |
|---|---|
| `title` | string |
| `description` | text |

### NavigatorAnchor

Transitions the viewer to a different VR tour when activated.

| Field | Type | Notes |
|---|---|---|
| `target_vr_tour` | FK VRTour | The tour to navigate to. Protected on delete — remove anchors before deleting the target tour. |

---

## API reference

All write endpoints require a **teacher** (own lessons only) or **admin** role.

Base path: `/api/lessons/<lesson_pk>/panels/`

### Panels

#### List panels
```
GET /api/lessons/{lesson_pk}/panels/
```
Returns all panels for the lesson in order, with nested `text_content` or `vr_tour` fully expanded (including anchors).

**Response**
```json
[
  {
    "id": 1,
    "lesson": 3,
    "type": "text",
    "order": 0,
    "title": "Introduction",
    "text_content": { "id": 1, "body": "..." },
    "vr_tour": null
  },
  {
    "id": 2,
    "lesson": 3,
    "type": "vr_tour",
    "order": 1,
    "title": "Bridge Entrance",
    "text_content": null,
    "vr_tour": {
      "id": 1,
      "scene_url": "/vr-scenes/Bridge entrance.jpg",
      "text_anchors": [...],
      "navigator_anchors": [...]
    }
  }
]
```

---

#### Create a text panel
```
POST /api/lessons/{lesson_pk}/panels/
```
```json
{
  "type": "text",
  "title": "Introduction",
  "order": 0,
  "body": "Full panel body text here."
}
```
Creates a `Panel` (type=text) and a linked `TextPanel` in a single operation.

---

#### Create a VR tour panel
```
POST /api/lessons/{lesson_pk}/panels/
```
```json
{
  "type": "vr_tour",
  "title": "Bridge Entrance",
  "order": 1,
  "scene_url": "/vr-scenes/Bridge entrance.jpg"
}
```
Creates a `Panel` (type=vr_tour) and a linked `VRTour`. Anchors are added separately after creation.

---

#### Update a panel
```
PATCH /api/lessons/{lesson_pk}/panels/{panel_pk}/
```
All fields are optional. Pass only what you want to change. `body` only applies to text panels; `scene_url` only applies to VR tour panels.

```json
{ "title": "New title", "order": 2 }
```
```json
{ "body": "Updated text content." }
```
```json
{ "scene_url": "/vr-scenes/Starboard wing.jpg" }
```

---

#### Delete a panel
```
DELETE /api/lessons/{lesson_pk}/panels/{panel_pk}/
```
Cascades — deletes the linked `TextPanel` or `VRTour` (and all its anchors).

---

### Text anchors

Anchor endpoints require the panel to be of type `vr_tour`. Passing a `text` panel returns `400`.

#### List
```
GET /api/lessons/{lesson_pk}/panels/{panel_pk}/text-anchors/
```

#### Create
```
POST /api/lessons/{lesson_pk}/panels/{panel_pk}/text-anchors/
```
```json
{
  "pos_x": 1.5,
  "pos_y": 1.2,
  "pos_z": -2.0,
  "title": "Helm Console",
  "description": "The primary steering station. Includes the autopilot interface and rudder angle indicator."
}
```

#### Update
```
PATCH /api/lessons/{lesson_pk}/panels/{panel_pk}/text-anchors/{anchor_pk}/
```
All fields are optional.

#### Delete
```
DELETE /api/lessons/{lesson_pk}/panels/{panel_pk}/text-anchors/{anchor_pk}/
```

---

### Navigator anchors

Same URL shape as text anchors, replace `text-anchors` with `navigator-anchors`.

#### Create
```
POST /api/lessons/{lesson_pk}/panels/{panel_pk}/navigator-anchors/
```
```json
{
  "pos_x": 0.0,
  "pos_y": 1.0,
  "pos_z": 3.0,
  "target_vr_tour": 7
}
```
`target_vr_tour` is the `id` of any existing `VRTour` (it does not have to belong to the same lesson).

#### Update
```
PATCH /api/lessons/{lesson_pk}/panels/{panel_pk}/navigator-anchors/{anchor_pk}/
```

#### Delete
```
DELETE /api/lessons/{lesson_pk}/panels/{panel_pk}/navigator-anchors/{anchor_pk}/
```

---

## Typical authoring workflow

```
1. Create the lesson
   POST /api/lessons/

2. Add a text panel
   POST /api/lessons/3/panels/
   { "type": "text", "title": "Overview", "order": 0, "body": "..." }

3. Add a VR tour panel
   POST /api/lessons/3/panels/
   { "type": "vr_tour", "title": "Bridge Entrance", "order": 1, "scene_url": "..." }
   → response contains vr_tour.id = 1

4. Add a second VR tour panel (so navigator anchors have a destination)
   POST /api/lessons/3/panels/
   { "type": "vr_tour", "title": "Starboard Wing", "order": 2, "scene_url": "..." }
   → response contains vr_tour.id = 2

5. Add text anchors to the first tour (panel id = 2)
   POST /api/lessons/3/panels/2/text-anchors/
   { "pos_x": 1.5, "pos_y": 1.2, "pos_z": -2.0, "title": "Helm Console", "description": "..." }

6. Add a navigator anchor pointing from tour 1 → tour 2
   POST /api/lessons/3/panels/2/navigator-anchors/
   { "pos_x": 0.0, "pos_y": 1.0, "pos_z": 3.0, "target_vr_tour": 2 }
```

---

## Available VR scenes

The following scene files live in `platform frontend/vrScenes/`:

| Display name | File |
|---|---|
| Bridge Entrance | `Bridge entrance.jpg` |
| Center AOOW | `Center AOOW.jpg` |
| Center OOW | `Center OOW.jpg` |
| Center Behind | `Center behind.jpg` |
| Center Forward | `Center forward.jpg` |
| Safety Center | `Safety center.jpg` |
| Starboard Wing | `Starboard wing.jpg` |

The recommended `scene_url` convention when serving these as static files is `/vr-scenes/<filename>`.

---

## Frontend integration guide

### Authentication

All panel endpoints require a JWT access token. Obtain one first:

```
POST /api/auth/login/
Content-Type: application/json

{ "username": "teacher@example.com", "password": "..." }
```

Response:
```json
{ "access": "<jwt_access_token>", "refresh": "<jwt_refresh_token>", "role": "teacher" }
```

Include the token on every subsequent request:
```
Authorization: Bearer <jwt_access_token>
```

Refresh a token before it expires:
```
POST /api/auth/token/refresh/
{ "refresh": "<jwt_refresh_token>" }
```

---

### Role requirements

Panel endpoints are **restricted to teachers and admins**. Students receive `403 Forbidden` on all panel routes.

| Role | Can read panels | Can write panels |
|---|---|---|
| `teacher` | Own lessons only | Own lessons only |
| `admin` | All lessons | All lessons |
| `student` | No | No |

---

### Common errors and their causes

#### 404 on `GET /api/lessons/{lesson_pk}/panels/`

The most common cause is that the lesson with that ID does not exist. Before hitting any panel endpoint, confirm the lesson exists:

```
GET /api/lessons/{lesson_pk}/
```

If that also returns 404, the lesson was never created (or you are using the wrong ID). Create it first:

```
POST /api/lessons/
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Bridge Navigation Overview",
  "category": "nav",
  "duration_minutes": 30,
  "visibility": "class",
  "difficulty": "intermediate"
}
```

The response will contain `"id": <lesson_pk>`. Use that ID for all subsequent panel requests.

#### 403 on any panel endpoint

Your JWT belongs to a user with role `student`. Panel endpoints require `teacher` or `admin`. Log in with a teacher or admin account.

#### 400 on `POST /api/lessons/{lesson_pk}/panels/` with `type: "vr_tour"`

`scene_url` must be a **full absolute URL** — not a relative path. The model field is `URLField` which rejects relative paths:

```json
// WRONG — relative path, returns 400
{ "scene_url": "/vr-scenes/Bridge entrance.jpg" }

// CORRECT — absolute URL
{ "scene_url": "http://localhost:8000/vr-scenes/Bridge%20entrance.jpg" }
```

In production replace `http://localhost:8000` with the domain that serves the VR scene assets. Note that spaces in filenames must be percent-encoded (`%20`) or the file should be renamed to use hyphens/underscores.

---

### Complete editor integration flow

Below is the sequence a lesson-editor UI should follow to build a lesson from scratch.

**Step 1 — Log in and store tokens**
```js
const { access, refresh, role } = await POST('/api/auth/login/', credentials);
```

**Step 2 — Create the lesson**
```js
const lesson = await POST('/api/lessons/', {
  title: 'Bridge Navigation Overview',
  category: 'nav',
  duration_minutes: 30,
  visibility: 'class',
  difficulty: 'intermediate',
});
const lessonId = lesson.id;  // store this
```

**Step 3 — Load existing panels** (empty array on first load)
```js
const panels = await GET(`/api/lessons/${lessonId}/panels/`);
```

**Step 4 — Add panels**

Text panel:
```js
await POST(`/api/lessons/${lessonId}/panels/`, {
  type: 'text',
  title: 'Introduction',
  order: 0,
  body: 'This lesson covers...',
});
```

VR tour panel (use the absolute URL of the served scene file):
```js
const panel = await POST(`/api/lessons/${lessonId}/panels/`, {
  type: 'vr_tour',
  title: 'Bridge Entrance',
  order: 1,
  scene_url: 'https://your-domain.com/vr-scenes/Bridge%20entrance.jpg',
});
const vrTourId = panel.vr_tour.id;  // needed when creating NavigatorAnchors
```

**Step 5 — Add anchors to VR tour panels**
```js
await POST(`/api/lessons/${lessonId}/panels/${panel.id}/text-anchors/`, {
  pos_x: 1.5, pos_y: 1.2, pos_z: -2.0,
  title: 'Helm Console',
  description: 'Primary steering station.',
});
```

**Step 6 — Reload panels to get the latest state**
```js
const panels = await GET(`/api/lessons/${lessonId}/panels/`);
```

---

### Complete viewer integration flow

Students view a lesson's panels by reading the lesson detail, then fetching panels. However, since panel endpoints are teacher/admin only, **you must proxy or embed panel data through a separate student-accessible endpoint**, or fetch panels server-side and embed them in the lesson response.

Currently the `GET /api/lessons/{pk}/` endpoint does **not** include panels in its response (`LessonSerializer` only returns lesson metadata). To display lesson content to students, one of these approaches is needed:

- **Option A (recommended):** Add a read-only `panels` field to `LessonSerializer` that includes the full panel tree. Gate write access on the individual panel endpoints (already done), but allow GET on `PanelListCreateView` for any authenticated user if they have access to the lesson.
- **Option B:** Create a dedicated student-facing endpoint (e.g. `GET /api/lessons/{pk}/content/`) that returns panels along with the lesson.

Until one of these is implemented, only teachers and admins can retrieve panel content via the API.

---

## Extending with new anchor types

New anchor types follow the same pattern:

1. Subclass the abstract `Anchor` in `apps/lessons/models.py`
2. Add a `ForeignKey` to `VRTour` with a unique `related_name`
3. Add read and write serializers in `serializers.py`
4. Add list/create and detail views in `views.py`
5. Register the URL pair in `urls.py`

The abstract `Anchor` provides `pos_x`, `pos_y`, `pos_z` automatically — subclasses only need to declare their own additional fields.
