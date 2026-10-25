# 🔐 Complete Authentication System

### JWT Authentication • Refresh Token Rotation • OTP Verification • Logout All Devices

A secure and scalable authentication backend built with **Node.js, Express.js, MongoDB, and JWT**. This project focuses on modern authentication workflows, session management, token security, and account protection.

Designed as a reusable authentication service that can be integrated with React applications and other frontend clients.

---

## 🚀 Features

- 🔑 **User Authentication** — Registration and login with email and password.
- 🔒 **JWT Authentication** — Token-based authentication for protected routes.
- 🔄 **Refresh Tokens** — Renew access tokens without requiring users to log in again.
- ♻️ **Refresh Token Rotation** — Replace refresh tokens during renewal and detect reuse.
- 📩 **OTP Verification** — Verify user identity using one-time passwords.
- 🔁 **Resend OTP** — Request a new verification code with appropriate restrictions.
- 🚪 **Logout** — End the current authenticated session.
- 📱 **Logout All Devices** — Revoke active refresh sessions across devices.
- 🔑 **Password Management** — Secure password hashing and password recovery workflows.
- 🛡️ **Protected Routes** — Middleware-based authentication and authorization.
- ⚙️ **Environment Configuration** — Keep secrets and database credentials outside source code.
- 🧱 **Modular Architecture** — Organized routes, controllers, services, middleware, and models.

> Note: Features describe the intended project scope. Update this list to reflect what is implemented and tested in your repository.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend REST API |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JSON Web Token (JWT) | Token-based authentication |
| bcrypt / Argon2 | Password hashing |
| dotenv | Environment variable management |
| Nodemon | Development server |
| Nodemailer | Email and OTP delivery, if configured |

---

## 🏗️ Project Architecture

```text
auth-service/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── models/
│   │   ├── user.model.js
│   │   ├── session.model.js
│   │   └── otp.model.js
│   │
│   ├── routes/
│   │   └── auth.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── token.service.js
│   │   └── otp.service.js
│   │
│   ├── utils/
│   │   └── ApiError.js
│   │
│   └── app.js
│
├── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

*This is a suggested structure. Your actual folders and filenames may differ.*

---

## 🔐 How Authentication Works

### 1. User Registration

1. The user submits registration details.
2. The server validates the request.
3. The password is securely hashed.
4. The user account is saved in MongoDB.
5. An OTP may be sent for email verification.
6. The account is verified after successful OTP validation.

### 2. User Login

1. The user submits email and password.
2. The server validates the credentials.
3. The server checks account verification and status.
4. An access token is generated.
5. A refresh token is issued.
6. The session is stored or tracked for future revocation.

### 3. Access Token and Refresh Token

| Access Token | Refresh Token |
|---|---|
| Short-lived | Longer-lived |
| Used to access protected APIs | Used to obtain new access tokens |
| Sent with authenticated requests | Sent only to the refresh endpoint |
| Expires frequently | Rotated and revoked according to session policy |

**Token refresh flow:**

```text
Client
  |
  v
Access Token Expires
  |
  v
Send Refresh Token
  |
  v
Validate Refresh Token
  |
  v
Rotate Refresh Token
  |
  v
Issue New Access Token
  |
  v
Continue Authenticated Session
```

### 4. OTP Verification

```text
Request OTP
    |
    v
Generate One-Time Code
    |
    v
Send Code to User
    |
    v
User Submits OTP
    |
    v
Validate Code and Expiry
    |
    v
Verify Account
```

OTP codes should expire, have attempt limits, be single-use, and be protected against repeated requests.

### 5. Logout From All Devices

```text
User Requests Global Logout
           |
           v
Validate Authentication
           |
           v
Find User Sessions
           |
           v
Revoke All Refresh Sessions
           |
           v
Prevent Future Token Refresh
```

Revoking refresh sessions prevents future token renewal. Already-issued access tokens may remain valid until expiration unless additional revocation checks are implemented.

---

## 🔌 API Endpoints

The following endpoints are a suggested API design. Adjust them to match your actual Express routes.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new account |
| POST | `/api/auth/login` | Log in to an account |
| POST | `/api/auth/refresh` | Refresh the access token |
| POST | `/api/auth/logout` | Log out from the current session |
| POST | `/api/auth/logout-all` | Log out from all devices |
| POST | `/api/auth/send-otp` | Request an OTP |
| POST | `/api/auth/verify-otp` | Verify an OTP |
| POST | `/api/auth/forgot-password` | Start password recovery |
| POST | `/api/auth/reset-password` | Reset the password |
| GET | `/api/auth/me` | Get the authenticated user's profile |

**Authentication requirements**

- Public routes: registration, login, and eligible OTP or recovery requests.
- Protected routes: user profile and logout operations.
- Refresh route: requires a valid refresh token.
- Password reset: requires a valid recovery flow.

---

## ⚙️ Installation