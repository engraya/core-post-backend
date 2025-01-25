## System Requirements

- Node.js (v10.13.0+) -> (Required) A Node version of this, or higher, is required.

## Installation Steps

1. Install the dependencies `npm install`

2. Run the server with `npm run start` and visit http://localhost:8000/
  
#### Localhost Links

The USER API urls are:
```bash
1. REGISTER - POST http://localhost:8000/api/auth/register
2. LOGIN - POST http://localhost:8000/api/auth/login
3. LOGOUT - POST http://localhost:8000/api/auth/logout
4. SEND VERIFICATION CODE - PATCH http://localhost:8000/api/auth/send-verification-code
5. VERIFY VERIFICATION CODE - GET http://localhost:8000/api/auth/verify-verification-code
6. CHANGE PASSWORD - DELETE http://localhost:8000/api/auth/change-password
7. FORGOT PASSWORD - DELETE http://localhost:8000/api/auth/forgot-password
8. VERIFY FORGOT PASSWORD - DELETE http://localhost:8000/api/auth/verify-forgot-password
```
```bash
The POST API urls are:
1. GET ALL POSTS - GET http://localhost:8000/api/posts
2. CREATE POST - POST http://localhost:8000/api/posts/create
3. GET SINGLE POST- PUT http://localhost:8000/api/posts/:id
4. UPDATE POST - PATCH http://localhost:8000/api/posts/:id
5. DELETE POST - DELETE http://localhost:8000/api/posts/:id
```
#### Localhost Links
https://core-post.onrender.com/api/auth
