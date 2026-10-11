<a href="https://takshahub.onrender.com"><img align="right" src="./backend-button.svg" width="140" alt="Live Backend" /></a>

### TakshaHub Backend

<em>A TypeScript and Express REST API for school administration, academic setup, user access, and attendance management.</em>

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js" />
  &nbsp;
  <img src="https://img.shields.io/badge/Express-222222?style=flat&logo=express&logoColor=white" alt="Express" />
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  &nbsp;
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  &nbsp;
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white" alt="Prisma" />
  &nbsp;
  <img src="https://img.shields.io/badge/Zod-3E67B1?style=flat&logo=zod&logoColor=white" alt="Zod" />
</p>

<hr />

### 🚀 About the project

**TakshaHub Backend** provides the API for a school-management application. It supports school and administrator registration, cookie-based authentication, school-scoped organization and academic setup, class and subject management, student enrollment, teacher assignments, and attendance workflows.

The API is built with Express and TypeScript. Prisma connects it to PostgreSQL, and authenticated endpoints use signed JWTs stored in HTTP-only cookies.

### ✨ Features

<table>
  <tr>
    <td valign="top">

- ✅ Register a school and its initial administrator
- ✅ Log in, log out, and retrieve the current authenticated user
- ✅ HTTP-only cookie authentication with signed JWTs
- ✅ Manage organization members, roles, and role-permission templates
- ✅ Build a role-aware application sidebar

</td>
    <td valign="top">

- ✅ Manage academic years and activate the current year
- ✅ Manage classes, sections, and subjects
- ✅ Enroll students and assign class and subject teachers
- ✅ Record and retrieve student and teacher attendance
- ✅ Validate request data with Zod and handle API errors centrally

</td>
  </tr>
</table>

### 🛠️ Tech Stack

|             Backend             |          Database          |         Auth & Validation          |        Tools & Utilities         |
| :-----------------------------: | :------------------------: | :-------------------------------: | :------------------------------: |
| Node.js, Express.js, TypeScript | PostgreSQL, Prisma Client | JWT, bcryptjs, HTTP-only cookies, Zod | CORS, Cookie Parser, dotenv, Upstash Redis |

### 🚀 Getting Started

<table>
  <tr>
    <td valign="top" width="40%">

#### Prerequisites

- **Node.js** (20.19 or newer)
- **npm**
- **PostgreSQL** database

#### ⚙️ Environment Variables

Create a `.env` file in the project root. The following values are required by the application:

```env
NODE_ENV=development
PORT=3030
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
JWT_ACCESS_SECRET=replace_with_a_long_random_secret
```

Optional configuration:

```env
BCRYPT_ROUNDS=10
MAIL_USER=
MAIL_PASSWORD=
```

> 💡 Keep `.env` private and never commit credentials or secret values.

</td>
    <td valign="top" width="60%">

#### Installation

1. Clone the repository

```bash
   git clone https://github.com/NEELSAMEL19/TakshaHub-Backend.git
   cd TakshaHub-Backend
```

2. Install dependencies

```bash
   npm install
```

3. Apply the Prisma migrations to your local database

```bash
   npx prisma migrate dev
```

4. Start the development server

```bash
   npm run dev
```

5. Build and start the production server

```bash
   npm run build
   npm start
```

The server listens on port `3030` by default. Set `PORT` in `.env` to use another port. For an already provisioned production database, apply checked-in migrations with `npx prisma migrate deploy` before starting the server.

</td>
  </tr>
</table>

### 🔗 API Endpoints (Base URL: `/api`)

All API endpoints are mounted under `/api`. Most organization, academic, management, and attendance operations require an authenticated administrator. Profile and sidebar endpoints require authentication; see the route middleware for the exact access rules.

<table>
  <tr>
    <td valign="top" width="60%">

| Area | Route prefix | Description | Access |
| :--- | :--- | :--- | :---: |
| Authentication | `/api/auth` | Register (`POST /register`), log in (`POST /login`), get current user (`GET /me`), and log out (`POST /logout`) | Public for register/login; authenticated for me/logout |
| Organization | `/api/organization/roles`, `/api/organization/member` | Create, list, retrieve, update, and delete roles or organization members | Administrator |
| Permissions | `/api/permissions/template` | Retrieve the permission template for a portal type | Administrator |
| Sidebar | `/api/sidebar` | Retrieve the signed-in user's role-aware navigation menu | Authenticated |
| Academic years | `/api/academic/academic_years` | Add, list, retrieve, update, activate, and remove academic years | Administrator |
| Classes and subjects | `/api/management/class`, `/api/management/subject` | Manage classes, sections, and subjects, including dropdown data | Administrator |
| Students and teachers | `/api/management/students`, `/api/management/class_teacher`, `/api/management/subject_teacher` | Enroll students and manage class-teacher and subject-teacher assignments | Administrator |
| Attendance | `/api/attendance/students`, `/api/attendance/teachers` | Retrieve attendance lists and toggle attendance records | Administrator |
| Profile | `/api/setting/profile` | Get and update the signed-in user's profile | Authenticated |

</td>
  </tr>
</table>

### 📁 Project Structure

```text
TakshaHub-Backend/
├── src/
│   ├── app.ts                 # Express configuration and middleware
│   ├── server.ts              # Startup and registry validation
│   ├── routes.ts              # API module mounts under /api
│   ├── common/
│   │   ├── middlewares/       # Auth, validation, and error handling
│   │   └── utils/             # Shared utilities and registry helpers
│   ├── config/                # Environment, Prisma, and Redis clients
│   └── modules/
│       ├── academic/          # Academic-year management
│       ├── attendance/        # Student and teacher attendance
│       ├── auth/              # Registration, login, and session APIs
│       ├── management/        # Classes, subjects, enrollments, assignments
│       ├── organization/      # Members and roles
│       ├── permissions/       # Permission templates
│       ├── setting/           # User profile
│       └── sidebar/           # Role-aware navigation
├── prisma/
│   ├── migrations/            # Database migration history
│   ├── schema.prisma          # PostgreSQL data model
│   └── seed.ts                # Database seed entry point
├── prisma.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

<table>
  <tr>
    <td valign="top" width="50%">

#### 👥 Contributing

Contributions are welcome! Open an issue to discuss a change or submit a pull request with a focused improvement.

</td>
    <td valign="top" width="50%">

#### 📄 License

The `package.json` currently declares the ISC license.

</td>
  </tr>
</table>

Made with ❤️ by [Neel Samel](https://github.com/NEELSAMEL19)
