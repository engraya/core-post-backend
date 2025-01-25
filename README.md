## System Requirements

- Node.js (v10.13.0+) -> (Required) A Node version of this, or higher, is required.

## Installation Steps

1. Install the dependencies `npm install`

2. Run the server with `npm run start` and visit http://localhost:8000/
  
#### Localhost Links

The USER API urls are:
REGISTER - POST http://localhost:8000/api/auth/register
LOGIN - POST http://localhost:8000/api/auth/login
LOGOUT - POST http://localhost:8000/api/auth/logout
SEND VERIFICATION CODE - PATCH http://localhost:8000/api/auth/send-verification-code
VERIFY VERIFICATION CODE - GET http://localhost:8000/api/auth/verify-verification-code
CHANGE PASSWORD - DELETE http://localhost:8000/api/auth/change-password
FORGOT PASSWORD - DELETE http://localhost:8000/api/auth/forgot-password
VERIFY FORGOT PASSWORD - DELETE http://localhost:8000/api/auth/verify-forgot-password

The POST API urls are:
GET ALL POSTS - GET http://localhost:8000/api/posts
CREATE POST - POST http://localhost:8000/api/posts/create
GET SINGLE POST- PUT http://localhost:8000/api/posts/:id
UPDATE POST - PATCH http://localhost:8000/api/posts/:id
DELETE POST - DELETE http://localhost:8000/api/posts/:id

#### Localhost Links
https://core-post.onrender.com/api/auth
