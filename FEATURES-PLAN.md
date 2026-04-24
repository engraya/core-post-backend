# Comments, likes/bookmarks, and user profiles

This document describes the features added to **core-post-backend**: post comments, likes and bookmarks, and user profile fields. All API routes are under `/api/v1`.

## User profiles

### Data model

- **`displayName`** — string, max 60 characters; defaults to the email local-part on registration if `displayName` is omitted in the register body.
- **`avatarUrl`** — optional HTTPS/HTTP URL, max 2048 characters.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `PATCH` | `/users/me` | JWT (`isAuthenticated`) | Update profile. Body must include at least one of `displayName` or `avatarUrl`. Sending `avatarUrl` as empty string clears it. |
| `POST` | `/auth/register` | — | Optional body field `displayName` (1–60 chars). |

Public `GET /users` and `GET /users/:id` responses include `displayName` and `avatarUrl` when present.

**Route ordering:** `/users/me` and `/users/me/bookmarks` are registered before `/users/:id` so `me` is not parsed as an id.

---

## Comments

### Data model

- **`Comment`**: `postId`, `userId`, `body` (max 2000 characters), timestamps.
- Index: `{ postId: 1, createdAt: -1 }`.
- Listing populates `userId` with `displayName`, `avatarUrl`, and `email`.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/posts/:postId/comments` | — | Paginated comments (`?page=`, 10 per page). |
| `POST` | `/posts/:postId/comments` | JWT + verified | Create comment; body `{ "body": "..." }`. |
| `PATCH` | `/posts/:postId/comments/:commentId` | JWT + verified | Update own comment. |
| `DELETE` | `/posts/:postId/comments/:commentId` | JWT + verified | Delete own comment. |

### Cascade

When a post is deleted by its owner, all comments for that post are removed (see `postService.deletePostForOwner`).

---

## Likes and bookmarks

### Data model

- **`PostLike`**: `userId`, `postId`, unique compound index `{ userId, postId }`.
- **`PostBookmark`**: same shape and unique index; index on `{ userId, createdAt }` for listing bookmarks.

### Behavior

- **Like:** `POST /posts/:postId/like` creates a like; duplicate like returns success with `alreadyLiked: true` (idempotent).
- **Unlike:** `DELETE /posts/:postId/like` removes the like if present.
- **Bookmark:** same pattern with `POST` / `DELETE` `/posts/:postId/bookmark`.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/posts/:postId/likes/count` | — | `{ count: number }`. |
| `POST` | `/posts/:postId/like` | JWT + verified | Like post. |
| `DELETE` | `/posts/:postId/like` | JWT + verified | Unlike post. |
| `POST` | `/posts/:postId/bookmark` | JWT + verified | Bookmark post. |
| `DELETE` | `/posts/:postId/bookmark` | JWT + verified | Remove bookmark. |
| `GET` | `/users/me/bookmarks` | JWT | Paginated bookmarks; each item populates `postId` with the post document. |

### Single post enrichment

`GET /posts/:_id` returns the post plus:

- `likeCount`, `bookmarkCount`
- If a **valid** JWT is sent (cookie `Authorization` or `Authorization: Bearer <token>`), **`likedByMe`** and **`bookmarkedByMe`** booleans

This uses **`optionalAuthenticated`** middleware so missing or invalid tokens do not return 401.

### Cascade

Deleting a post removes all likes and bookmarks for that post.

---

## Architecture notes

- Flow remains **Router → Controller → Service → Model** with Joi in `src/utils/validator.ts` and `AppError` for expected failures.
- New files include: `commentModel`, `postLikeModel`, `postBookmarkModel`, `commentService`, `engagementService`, related controllers, and `optionalAuthenticated` middleware.
