# Trello API (Node.js + Express + MongoDB)

Production-ready Trello-like API with JWT auth (httpOnly cookies), MongoDB models, Joi validation, file uploads (Cloudinary), email (MailerSend), and Socket.IO real-time notifications.

- Entry point: [src/server.js](src/server.js)
- Routing root: [`APIs_V1`](src/routes/v1/index.js)
- CORS config: [`corsOptions`](src/config/cors.js)
- Error handling: [src/middlewares/errorHandlingMiddleware.js](src/middlewares/errorHandlingMiddleware.js)

## Features

- Auth via JWT access/refresh tokens in cookies: [`JwtProvider`](src/providers/JwtProvider.js), [`authMiddleware.isAuthorized`](src/middlewares/authMiddleware.js)
- Boards/Columns/Cards CRUD with ordering, comments, and members
- Invitations flow for boards
- Email via MailerSend templates: [`MailerSendTemplateProvider.sendEmail`](src/providers/MailerSendTemplateProvider.js)
- File uploads to Cloudinary: [`CloudinaryProvider.streamUpload`](src/providers/CloudinaryProvider.js)
- Real-time invite notifications: [`inviteUserToBoardSocket`](src/sockets/inviteUserToBoardSocket.js)
- Validation with Joi in [src/validations](src/validations)

## Tech Stack

- Node.js 18+, Express 5, MongoDB 6 driver
- Babel + module alias `~` → `src`
- Socket.IO, Multer, Joi, bcryptjs, lodash

## Quick Start

Prerequisites:
- Node.js >= 18
- MongoDB connection URI
- MailerSend and Cloudinary accounts for email and media

Install:
```bash
npm i
```

Run (dev):
```bash
npm run dev
```

Build:
```bash
npm run build
```

Run (production):
```bash
npm run production
```

Health check:
```bash
curl -i http://localhost:3000/v1/status
```

Note: Auth cookies are `httpOnly`, `SameSite=None`, `secure=true`. Use HTTPS in local testing or adjust cookie flags in [`userController.login`](src/controllers/userController.js).

## Environment Variables (.env)

```bash
# Server
BUILD_MODE=dev
AUTHOR=YourName
LOCAL_DEV_APP_HOST=127.0.0.1
LOCAL_DEV_APP_PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://...
DATABASE_NAME=trello

# Website (used in emails)
WEBSITE_DOMAIN_DEVELOPMENT=http://localhost:5173
WEBSITE_DOMAIN_PRODUCTION=https://your-domain.com

# JWT
ACCESS_TOKEN_PRIVATE_KEY=your_access_secret
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_PRIVATE_KEY=your_refresh_secret
REFRESH_TOKEN_EXPIRATION=14d

# MailerSend
MAILER_SEND_API_KEY=...
ADMIN_SENDER_EMAIL=no-reply@your-domain.com
ADMIN_SENDER_NAME=Trello API
REGISTER_TEMPLATE_ID=your_template_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## API Overview

Base path: `/v1`

- Status
  - GET `/status`
- Users ([routes](src/routes/v1/userRoute.js), [controller](src/controllers/userController.js))
  - POST `/users/register` (validation: [`userValidation.createNew`](src/validations/userValidation.js))
  - PUT `/users/verify`
  - POST `/users/login`
  - DELETE `/users/logout`
  - GET `/users/refresh_token`
  - PUT `/users/update` (auth, Multer `avatar` field, validation: [`userValidation.update`](src/validations/userValidation.js))
- Boards ([routes](src/routes/v1/boardRoute.js), [service](src/services/boardService.js))
  - GET `/boards`
  - POST `/boards` (validation: [`boardValidation.createNew`](src/validations/boardValidation.js))
  - GET `/boards/:id`
  - PUT `/boards/:id`
  - PUT `/boards/supports/moving_card`
- Columns ([routes](src/routes/v1/columnRoute.js))
  - POST `/columns`
  - PUT `/columns/:id`
  - DELETE `/columns/:id`
- Cards ([routes](src/routes/v1/cardRoute.js))
  - POST `/cards`
  - PUT `/cards/:id` (Multer `cardCover` field, validation: [`cardValidation.update`](src/validations/cardValidation.js))
- Invitations ([routes](src/routes/v1/invitationRoute.js))
  - POST `/invitations/board`
  - GET `/invitations`
  - PUT `/invitations/board/:invitationId`

Validation rules live in:
- Boards: [src/validations/boardValidation.js](src/validations/boardValidation.js)
- Columns: [src/validations/columnValidation.js](src/validations/columnValidation.js)
- Cards: [src/validations/cardValidation.js](src/validations/cardValidation.js)
- Users: [src/validations/userValidation.js](src/validations/userValidation.js)

## Auth Flow (Cookies)

- Login issues `accessToken` and `refreshToken` cookies: [`userService.login`](src/services/userService.js)
- Protect routes with [`authMiddleware.isAuthorized`](src/middlewares/authMiddleware.js)
- Refresh access token via `/v1/users/refresh_token`: [`userService.refreshToken`](src/services/userService.js)

Example:
```bash
# Register
curl -X POST http://localhost:3000/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}' -i

# Login (stores cookies)
curl -X POST http://localhost:3000/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}' -i
```

## File Uploads

- User avatar: `PUT /v1/users/update` with multipart field `avatar`
- Card cover: `PUT /v1/cards/:id` with multipart field `cardCover`
- Multer config: [src/middlewares/multerUploadMiddleware.js](src/middlewares/multerUploadMiddleware.js)
- Cloudinary upload: [`CloudinaryProvider.streamUpload`](src/providers/CloudinaryProvider.js)

## Email

- Registration email with verification link: [`MailerSendTemplateProvider.sendEmail`](src/providers/MailerSendTemplateProvider.js)

## Real-time (Socket.IO)

- Server created in [src/server.js](src/server.js)
- Invite events:
  - Client emits: `FE_USER_INVITED_TO_BOARD`
  - Server broadcasts: `BE_USER_INVITED_TO_BOARD`
  - Handler: [`inviteUserToBoardSocket`](src/sockets/inviteUserToBoardSocket.js)

## Code Quality

- Lint: `npm run lint` (config: [.eslintrc.cjs](.eslintrc.cjs))
- Path alias `~/*` → `src/*` (see [.babelrc](.babelrc), [jsconfig.json](jsconfig.json))

## Project Structure

- Config: [src/config](src/config)
- Routes: [src/routes/v1](src/routes/v1)
- Controllers: [src/controllers](src/controllers)
- Services: [src/services](src/services)
- Models: [src/models](src/models)
- Middlewares: [src/middlewares](src/middlewares)
- Providers: [src/providers](src/providers)
- Utils: [src/utils](src/utils)
- Sockets: [src/sockets](src/sockets)
