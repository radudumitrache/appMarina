# Support Ticket System

## Overview

The support ticket system allows users to report problems and communicate with admins. Users submit tickets describing their issue; admins can respond via comments and update the ticket status. Users can track the status of their own tickets but cannot add comments.

---

## Data Models

### SupportTicket

| Field | Type | Notes |
|---|---|---|
| `ticket_id` | CharField | Auto-generated (e.g. `TK-001`), read-only |
| `author` | ForeignKey(User) | Set automatically to the submitting user |
| `subject` | CharField(300) | Short title of the issue |
| `description` | TextField | Full description of the problem |
| `tag` | CharField | One of: `Technical`, `Access`, `Account`, `Hardware`, `Other` |
| `status` | CharField | One of: `open`, `pending`, `resolved` — default `open` |
| `created_at` | DateTimeField | Auto-set on creation |
| `updated_at` | DateTimeField | Auto-updated on every save |

### TicketComment

| Field | Type | Notes |
|---|---|---|
| `ticket` | ForeignKey(SupportTicket) | The ticket this comment belongs to |
| `author` | ForeignKey(User) | The admin who wrote the comment |
| `body` | TextField | Comment content |
| `created_at` | DateTimeField | Auto-set on creation |

---

## API Endpoints

All endpoints require authentication (`Authorization: Bearer <access_token>`).

### List / Create Tickets

**`GET /api/support/tickets/`**

Returns a list of tickets with their comments and current status.
- Admins receive all tickets.
- Other users receive only their own tickets.

Optional query parameter: `?status=open|pending|resolved`

**`POST /api/support/tickets/`**

Submits a new ticket. Admins cannot submit tickets.

Request body:
```json
{
  "subject": "Cannot access lesson materials",
  "description": "When I click on lesson 3, I get a 403 error.",
  "tag": "Access"
}
```

Response (`201 Created`):
```json
{
  "id": 1,
  "ticket_id": "TK-001",
  "author": 5,
  "author_name": "John Doe",
  "subject": "Cannot access lesson materials",
  "description": "When I click on lesson 3, I get a 403 error.",
  "tag": "Access",
  "status": "open",
  "comments": [],
  "created_at": "2026-04-27T10:00:00Z",
  "updated_at": "2026-04-27T10:00:00Z"
}
```

---

### Ticket Detail

**`GET /api/support/tickets/<id>/`**

Returns a single ticket with all its comments.
- Admins can retrieve any ticket.
- Other users can only retrieve their own tickets (returns `404` otherwise).

**`PATCH /api/support/tickets/<id>/`**

Admin-only. Updates the status of a ticket.

Request body:
```json
{
  "status": "pending"
}
```

---

### Ticket Comments

**`POST /api/support/tickets/<id>/comments/`**

Admin-only. Adds a comment to a ticket.

Request body:
```json
{
  "body": "We are looking into this issue. Could you confirm which browser you are using?"
}
```

Response (`201 Created`):
```json
{
  "id": 1,
  "author": 2,
  "author_name": "Support Admin",
  "body": "We are looking into this issue. Could you confirm which browser you are using?",
  "created_at": "2026-04-27T11:00:00Z"
}
```

---

## Permissions Summary

| Action | Student / Teacher | Admin |
|---|---|---|
| Submit a ticket | Yes | No |
| View own tickets | Yes | — |
| View all tickets | No | Yes |
| View ticket status | Yes | Yes |
| View comments on a ticket | Yes (own tickets only) | Yes |
| Add a comment | No | Yes |
| Change ticket status | No | Yes |

---

## Ticket Lifecycle

```
open  -->  pending  -->  resolved
  ^            |
  |____________|   (can be re-opened by setting status back to open)
```

- **open** — ticket has been submitted and not yet acted on.
- **pending** — admin has acknowledged the ticket and is working on it or awaiting user information.
- **resolved** — the issue has been addressed.

Status transitions are performed by an admin via `PATCH /api/support/tickets/<id>/` with `{ "status": "<new_status>" }`.

---

## Django Admin

The Django admin panel (`/admin/`) provides a full management interface:

- **SupportTicket** list with filters by `status` and `tag`, and search by ticket ID, subject, description, or author name.
- Inline comment editor on each ticket detail page — admins can read and write comments without leaving the ticket view.
- Bulk actions: mark selected tickets as `open`, `pending`, or `resolved`.
- **TicketComment** is also registered as a standalone admin view for searching across all comments.
