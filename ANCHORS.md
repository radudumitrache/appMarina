# Anchor System

Anchors are interactive hotspots placed at specific 3-D coordinates inside a **VR tour** panel. They are always scoped to a `VRTour`, which is itself scoped to a `Panel` of type `vr_tour`, which is scoped to a `Lesson`.

> **Prerequisite:** the panel must be of type `vr_tour`. Sending any anchor request against a `text` panel returns `400 Bad Request` with `{"detail": "This panel is not a VR tour."}`.

---

## Anchor types

### Common position fields (all anchor types)

Every anchor — regardless of type — carries these three position fields.

| Field | Type | Description |
|---|---|---|
| `pos_x` | float | X coordinate in the 3-D scene (metres, right-handed system) |
| `pos_y` | float | Y coordinate (height) |
| `pos_z` | float | Z coordinate (depth) |

---

### TextAnchor

Displays an info card (title + description) when the user activates the hotspot.

| Field | Type | Writable | Description |
|---|---|---|---|
| `id` | int | No | Auto-assigned primary key |
| `pos_x` | float | Yes | X position |
| `pos_y` | float | Yes | Y position |
| `pos_z` | float | Yes | Z position |
| `title` | string (max 300) | Yes | Heading shown on the card |
| `description` | text | Yes | Body text shown on the card |

**Example object**
```json
{
  "id": 4,
  "pos_x": 1.5,
  "pos_y": 1.2,
  "pos_z": -2.0,
  "title": "Helm Console",
  "description": "The primary steering station. Includes the autopilot interface and rudder angle indicator."
}
```

---

### NavigatorAnchor

Transitions the viewer to a different VR tour when activated — used to link scenes together.

| Field | Type | Writable | Description |
|---|---|---|---|
| `id` | int | No | Auto-assigned primary key |
| `pos_x` | float | Yes | X position |
| `pos_y` | float | Yes | Y position |
| `pos_z` | float | Yes | Z position |
| `target_vr_tour` | int (FK → VRTour) | Yes | ID of the `VRTour` to navigate to |

> `target_vr_tour` uses `PROTECT` on delete — you must remove all `NavigatorAnchor` rows pointing at a `VRTour` before that tour can be deleted.

**Example object**
```json
{
  "id": 2,
  "pos_x": 0.0,
  "pos_y": 1.0,
  "pos_z": 3.0,
  "target_vr_tour": 7
}
```

---

### PolygonAnchor

Defines a polygon region inside the scene. The anchor has a 3-D origin (`pos_x/y/z`), a `title`, free-form `content`, and a list of **points** (vertices) that describe the polygon shape.

| Field | Type | Writable | Description |
|---|---|---|---|
| `id` | int | No | Auto-assigned primary key |
| `pos_x` | float | Yes | X position (anchor origin) |
| `pos_y` | float | Yes | Y position (anchor origin) |
| `pos_z` | float | Yes | Z position (anchor origin) |
| `title` | string (max 300) | Yes | Heading shown for the polygon |
| `content` | text | Yes | Body text / description |
| `points` | array | No (managed via sub-endpoint) | Ordered list of polygon vertices |

Each **point** object has:

| Field | Type | Writable | Description |
|---|---|---|---|
| `id` | int | No | Auto-assigned primary key |
| `x` | float | Yes | X coordinate of the vertex |
| `y` | float | Yes | Y coordinate of the vertex |
| `z` | float | Yes | Z coordinate of the vertex |
| `order` | int | Yes | Index of the vertex within the polygon (0-based) |

**Example object**
```json
{
  "id": 1,
  "pos_x": 0.0,
  "pos_y": 1.0,
  "pos_z": -3.0,
  "title": "Restricted Zone",
  "content": "Do not enter this area without PPE.",
  "points": [
    { "id": 1, "x": -1.0, "y": 0.0, "z": -2.0, "order": 0 },
    { "id": 2, "x":  1.0, "y": 0.0, "z": -2.0, "order": 1 },
    { "id": 3, "x":  1.0, "y": 0.0, "z": -4.0, "order": 2 },
    { "id": 4, "x": -1.0, "y": 0.0, "z": -4.0, "order": 3 }
  ]
}
```

---

## Permissions

All anchor endpoints require a valid JWT (see [PANELS_AND_VR.md](PANELS_AND_VR.md) for authentication details).

| Role | Read | Write (create / update / delete) |
|---|---|---|
| `teacher` | Own lessons only | Own lessons only |
| `admin` | All lessons | All lessons |
| `student` | `403 Forbidden` | `403 Forbidden` |

---

## Base URL pattern

```
/api/lessons/{lesson_pk}/panels/{panel_pk}/
```

All anchor endpoints are nested under this path.

---

## TextAnchor endpoints

### List text anchors

```
GET /api/lessons/{lesson_pk}/panels/{panel_pk}/text-anchors/
```

Returns all `TextAnchor` objects for the given VR tour panel, ordered by database insertion order.

**Response — 200 OK**
```json
[
  {
    "id": 4,
    "pos_x": 1.5,
    "pos_y": 1.2,
    "pos_z": -2.0,
    "title": "Helm Console",
    "description": "The primary steering station."
  },
  {
    "id": 5,
    "pos_x": -0.5,
    "pos_y": 0.8,
    "pos_z": 1.0,
    "title": "Engine Telegraph",
    "description": "Controls engine speed and direction signals."
  }
]
```

---

### Create a text anchor

```
POST /api/lessons/{lesson_pk}/panels/{panel_pk}/text-anchors/
```

**Request body — all fields required**
```json
{
  "pos_x": 1.5,
  "pos_y": 1.2,
  "pos_z": -2.0,
  "title": "Helm Console",
  "description": "The primary steering station. Includes the autopilot interface and rudder angle indicator."
}
```

**Response — 201 Created**
```json
{
  "id": 4,
  "pos_x": 1.5,
  "pos_y": 1.2,
  "pos_z": -2.0,
  "title": "Helm Console",
  "description": "The primary steering station. Includes the autopilot interface and rudder angle indicator."
}
```

---

### Update a text anchor

```
PATCH /api/lessons/{lesson_pk}/panels/{panel_pk}/text-anchors/{anchor_pk}/
```

All fields are optional — send only what you want to change.

**Request body examples**
```json
{ "title": "Autopilot Panel" }
```
```json
{ "pos_x": 2.0, "pos_y": 1.5, "pos_z": -1.8 }
```
```json
{ "description": "Updated description text." }
```

**Response — 200 OK** — returns the full updated anchor object.

---

### Delete a text anchor

```
DELETE /api/lessons/{lesson_pk}/panels/{panel_pk}/text-anchors/{anchor_pk}/
```

**Response — 204 No Content**

---

## NavigatorAnchor endpoints

### List navigator anchors

```
GET /api/lessons/{lesson_pk}/panels/{panel_pk}/navigator-anchors/
```

Returns all `NavigatorAnchor` objects for the given VR tour panel.

**Response — 200 OK**
```json
[
  {
    "id": 2,
    "pos_x": 0.0,
    "pos_y": 1.0,
    "pos_z": 3.0,
    "target_vr_tour": 7
  }
]
```

---

### Create a navigator anchor

```
POST /api/lessons/{lesson_pk}/panels/{panel_pk}/navigator-anchors/
```

`target_vr_tour` can point to any existing `VRTour` — it does not have to belong to the same lesson or even the same panel.

**Request body — all fields required**
```json
{
  "pos_x": 0.0,
  "pos_y": 1.0,
  "pos_z": 3.0,
  "target_vr_tour": 7
}
```

**Response — 201 Created**
```json
{
  "id": 2,
  "pos_x": 0.0,
  "pos_y": 1.0,
  "pos_z": 3.0,
  "target_vr_tour": 7
}
```

---

### Update a navigator anchor

```
PATCH /api/lessons/{lesson_pk}/panels/{panel_pk}/navigator-anchors/{anchor_pk}/
```

All fields are optional.

**Request body examples**
```json
{ "target_vr_tour": 9 }
```
```json
{ "pos_x": 0.5, "pos_z": 2.5 }
```

**Response — 200 OK** — returns the full updated anchor object.

---

### Delete a navigator anchor

```
DELETE /api/lessons/{lesson_pk}/panels/{panel_pk}/navigator-anchors/{anchor_pk}/
```

**Response — 204 No Content**

---

## PolygonAnchor endpoints

### List polygon anchors

```
GET /api/lessons/{lesson_pk}/panels/{panel_pk}/polygon-anchors/
```

Returns all `PolygonAnchor` objects for the given VR tour panel, each with its full `points` array.

**Response — 200 OK**
```json
[
  {
    "id": 1,
    "pos_x": 0.0,
    "pos_y": 1.0,
    "pos_z": -3.0,
    "title": "Restricted Zone",
    "content": "Do not enter this area without PPE.",
    "points": [
      { "id": 1, "x": -1.0, "y": 0.0, "z": -2.0, "order": 0 }
    ]
  }
]
```

---

### Create a polygon anchor

```
POST /api/lessons/{lesson_pk}/panels/{panel_pk}/polygon-anchors/
```

Creates the anchor itself. Add vertices separately via the points sub-endpoint.

**Request body — all fields required**
```json
{
  "pos_x": 0.0,
  "pos_y": 1.0,
  "pos_z": -3.0,
  "title": "Restricted Zone",
  "content": "Do not enter this area without PPE."
}
```

**Response — 201 Created** — returns the full anchor object (empty `points` array until vertices are added).

---

### Update a polygon anchor

```
PATCH /api/lessons/{lesson_pk}/panels/{panel_pk}/polygon-anchors/{anchor_pk}/
```

All fields are optional.

**Response — 200 OK** — returns the full updated anchor object.

---

### Delete a polygon anchor

```
DELETE /api/lessons/{lesson_pk}/panels/{panel_pk}/polygon-anchors/{anchor_pk}/
```

Deletes the anchor and all its points.

**Response — 204 No Content**

---

## PolygonAnchorPoint endpoints

### List points

```
GET /api/lessons/{lesson_pk}/panels/{panel_pk}/polygon-anchors/{anchor_pk}/points/
```

**Response — 200 OK**
```json
[
  { "id": 1, "x": -1.0, "y": 0.0, "z": -2.0, "order": 0 },
  { "id": 2, "x":  1.0, "y": 0.0, "z": -2.0, "order": 1 }
]
```

---

### Add a point

```
POST /api/lessons/{lesson_pk}/panels/{panel_pk}/polygon-anchors/{anchor_pk}/points/
```

**Request body — all fields required**
```json
{ "x": -1.0, "y": 0.0, "z": -2.0, "order": 0 }
```

**Response — 201 Created**

---

### Update a point

```
PATCH /api/lessons/{lesson_pk}/panels/{panel_pk}/polygon-anchors/{anchor_pk}/points/{point_pk}/
```

All fields optional.

**Response — 200 OK**

---

### Delete a point

```
DELETE /api/lessons/{lesson_pk}/panels/{panel_pk}/polygon-anchors/{anchor_pk}/points/{point_pk}/
```

**Response — 204 No Content**

---

## Error reference

| Status | Cause |
|---|---|
| `400 Bad Request` — `"This panel is not a VR tour."` | The `panel_pk` resolves to a `text` panel. Anchors can only be placed on `vr_tour` panels. |
| `400 Bad Request` — field validation errors | A required field is missing or has an invalid value. |
| `403 Forbidden` | The authenticated user does not have access to the lesson (wrong role, or teacher accessing another teacher's lesson). |
| `404 Not Found` | The lesson, panel, or anchor ID does not exist. |

---

## Relationship to the panel list response

Anchors are also embedded directly in the panel list response — you do not need to call the anchor endpoints just to read them. When you call:

```
GET /api/lessons/{lesson_pk}/panels/
```

each `vr_tour` panel already includes fully expanded `text_anchors` and `navigator_anchors` arrays:

```json
{
  "id": 2,
  "type": "vr_tour",
  "vr_tour": {
    "id": 1,
    "scene_url": "/vr-scenes/Bridge entrance.jpg",
    "text_anchors": [
      { "id": 4, "pos_x": 1.5, "pos_y": 1.2, "pos_z": -2.0, "title": "Helm Console", "description": "..." }
    ],
    "navigator_anchors": [
      { "id": 2, "pos_x": 0.0, "pos_y": 1.0, "pos_z": 3.0, "target_vr_tour": 7 }
    ],
    "polygon_anchors": [
      { "id": 1, "pos_x": 0.0, "pos_y": 1.0, "pos_z": -3.0, "title": "Restricted Zone", "content": "...", "points": [] }
    ]
  }
}
```

Use the dedicated anchor endpoints only when you need to **create, update, or delete** individual anchors after the panel already exists.
