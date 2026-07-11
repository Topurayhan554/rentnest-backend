# RentNest 🏠

**Find & List Rental Properties with Ease**

RentNest is a backend REST API for a rental property marketplace. Landlords can list properties, manage availability, and approve or reject rental requests. Tenants can browse listings, submit rental requests, make payments, and leave reviews. Admins oversee the entire platform, managing users and moderating content.

---

## 📌 Live Links

| Item | Link |
|---|---|
| **Backend Repo** | https://github.com/Topurayhan554/rentnest-backend |
| **Live API** | https://rentnest-backend-rouge.vercel.app/ |
| **API Documentation (Postman)** | *[https://drive.google.com/file/d/1Zr1JfZnEaj6bT0oLWzMQCGXGkqORb4R0/view?usp=drive_link]* |
| **Demo Video** | *[https://drive.google.com/file/d/1DFmQesdy53YiH8eH4Ok8wbxFBiiB6HuY/view?usp=drive_link]* |

### 🔑 Admin Credentials
```
Email    : admin@rentnest.com
Password : admin123
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma (with `@prisma/adapter-pg`) |
| Authentication | JWT (Access + Refresh Token) |
| Payment | Stripe (Checkout Session + Webhook) |
| Validation | Zod |
| Deployment | Vercel |

---

## 👥 Roles & Permissions

| Role | Description | Key Permissions |
|---|---|---|
| **Tenant** | Users looking for rental properties | Browse listings, submit rental requests, make payments, leave reviews, manage profile |
| **Landlord** | Property owners who list rentals | Create/manage listings, approve/reject requests, view tenant history |
| **Admin** | Platform moderators | Manage all users, oversee all listings & requests, manage categories |

> 💡 Users select their role during registration (`TENANT`, `LANDLORD`, or `ADMIN`).

---

## 📁 Project Structure

```
rentnest-backend/
├── api/
│   └── index.ts               # Vercel serverless entry point
├── prisma/
│   ├── schema/                # Multi-file Prisma schema
│   │   ├── schema.prisma
│   │   ├── enums.prisma
│   │   ├── user.prisma
│   │   ├── category.prisma
│   │   ├── property.prisma
│   │   ├── rentalRequest.prisma
│   │   ├── payment.prisma
│   │   └── review.prisma
│   └── seed.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── lib/                   # prisma client, stripe client
│   ├── middlewares/           # auth, validateRequest, error handlers
│   ├── utils/                 # catchAsync, sendResponse, jwt, AppError
│   └── modules/
│       ├── auth/
│       ├── user/
│       ├── category/
│       ├── property/
│       ├── rentalRequest/
│       ├── payment/
│       ├── review/
│       ├── admin/
│       └── landlord/
├── prisma.config.ts
├── vercel.json
├── tsup.config.ts
└── package.json
```

Each module follows a consistent pattern: `route → controller → service → interface → validation`.

---

## ✨ Features

### Public
- Browse all available rental properties
- Search and filter by location, price range, property type, and category
- View detailed property listings and reviews

### Tenant
- Register and login
- Submit rental requests for properties
- Make payments via Stripe after rental request approval
- View payment history and payment status
- View rental request history (`PENDING` → `APPROVED` → `ACTIVE` → `COMPLETED`)
- Leave reviews after a completed rental
- Manage profile

### Landlord
- Register and login
- Create, update, and remove property listings
- Approve or reject rental requests
- View rental requests for their own properties

### Admin
- View and manage all users (ban/unban)
- View all properties and rental requests
- Manage property categories

---

## 🔄 Rental Request Status Flow

```
PENDING → APPROVED → (Payment via Stripe) → ACTIVE → COMPLETED
              │
              └──────→ REJECTED
```

- `PENDING` — created automatically when a tenant submits a request
- `APPROVED` / `REJECTED` — set by the landlord
- `ACTIVE` — set automatically by the Stripe webhook after successful payment
- `COMPLETED` — set by the landlord once the rental period ends (enables reviews)

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh-token` | Public |

### Users
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/users/register` | Public |
| GET | `/api/users/me` | Authenticated |
| PATCH | `/api/users/my-profile` | Authenticated |

### Categories
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/categories` | Public |
| GET | `/api/categories/:id` | Public |
| POST | `/api/categories` | Admin |
| PUT | `/api/categories/:id` | Admin |
| DELETE | `/api/categories/:id` | Admin |

### Properties
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/properties` | Public (supports `searchTerm`, `location`, `minPrice`, `maxPrice`, `type`, `categoryId`, `page`, `limit`, `sortBy`, `sortOrder`) |
| GET | `/api/properties/:id` | Public |
| GET | `/api/properties/my-properties` | Landlord |
| POST | `/api/properties` | Landlord |
| PATCH | `/api/properties/:id` | Landlord (owner) |
| DELETE | `/api/properties/:id` | Landlord (owner) |

### Landlord (spec-aligned aliases)
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/landlord/properties` | Landlord |
| PUT | `/api/landlord/properties/:id` | Landlord (owner) |
| DELETE | `/api/landlord/properties/:id` | Landlord (owner) |
| GET | `/api/landlord/requests` | Landlord |
| PATCH | `/api/landlord/requests/:id` | Landlord (owner) |

### Rental Requests
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/rentals` | Tenant |
| GET | `/api/rentals/my-requests` | Tenant |
| GET | `/api/rentals/landlord-requests` | Landlord |
| GET | `/api/rentals/:id` | Tenant / Landlord / Admin |
| PATCH | `/api/rentals/:id` | Landlord (owner) |

### Payments (Stripe)
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/payments/create` | Tenant |
| POST | `/api/payments/confirm` | Stripe Webhook only |
| GET | `/api/payments` | Tenant |
| GET | `/api/payments/:id` | Tenant / Landlord / Admin |

### Reviews
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/reviews` | Tenant (after `COMPLETED` rental) |
| GET | `/api/reviews/property/:propertyId` | Public |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id` | Admin |
| GET | `/api/admin/properties` | Admin |
| GET | `/api/admin/rentals` | Admin |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
APP_URL=https://rentnest-backend.vercel.app

DATABASE_URL="postgresql://user:password@host:5432/rentnest?sslmode=require"

BCRYPT_SALT_ROUNDS=12

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

---

## 🚀 Getting Started (Local Setup)

```bash
# 1. Clone the repository
git clone https://github.com/username/rentnest-backend.git
cd rentnest-backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create .env file as shown above

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed the database (admin, sample users, categories, properties)
npm run seed

# 6. Start the development server
npm run dev
```

Server runs at `http://localhost:5000`.

### Testing Stripe Webhooks Locally
Stripe cannot reach `localhost` directly, so the Stripe CLI is used to forward webhook events during local development:

```bash
stripe login
stripe listen --forward-to localhost:5000/api/payments/confirm
```

Copy the `whsec_...` secret it generates into `STRIPE_WEBHOOK_SECRET` in `.env`, then restart the dev server.

---

## 💳 Payment Flow

1. Tenant submits a rental request → status `PENDING`
2. Landlord approves it → status `APPROVED`
3. Tenant calls `POST /api/payments/create` with the `rentalRequestId` → receives a Stripe Checkout `paymentUrl`
4. Tenant completes payment on Stripe's hosted checkout page using a test card:
   ```
   Card Number : 4242 4242 4242 4242
   Expiry      : any future date
   CVC         : any 3 digits
   ```
5. Stripe sends a `checkout.session.completed` webhook to `/api/payments/confirm`
6. The webhook handler marks the payment `COMPLETED` and the rental request `ACTIVE`

---

## ✅ Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Human readable error message",
  "errorDetails": "..."
}
```

---

## 📄 License

This project was built as part of the Programming Hero backend assignment. All work is original.
