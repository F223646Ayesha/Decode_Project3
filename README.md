# BookTracker — Project 3: Database Integration
**DecodeLabs Full Stack Development | Industrial Training Kit | Batch 2026**

A full-stack book tracking app where users register, add books, tag them with genres, and leave ratings/reviews. Built to satisfy every requirement in the Project 3 brief.

## Stack
Node.js, Express, MongoDB, Mongoose, JWT + bcrypt auth, vanilla HTML/CSS/JS frontend — consistent with ShopEase and Connectly.

## How this maps to the brief's 4 pillars

**Pillar 1 — The Blueprint (Schema & Design)**
- `User` ↔ `Profile` — **1:1** (unique `user` field on Profile)
- `User` → `Review` — **1:Many**
- `Book` → `Review` — **1:Many**
- `Book` ↔ `Genre` — **Many:Many** (array of ObjectId refs)

**Pillar 2 — The Bridge (Integration)**
Mongoose ODM connects Express to MongoDB (`config/db.js`), using schema validation instead of raw driver boilerplate.

**Pillar 3 — The Action (CRUD & REST)**
Every resource (`/api/auth`, `/api/books`, `/api/genres`, `/api/reviews`) implements full CRUD mapped correctly:
- `POST` → Create
- `GET` → Read
- `PUT` → Update
- `DELETE` → Delete

**Pillar 4 — The Shield (Integrity & Security)**
- Schema-level `required`, `unique`, `min`/`max`, and regex constraints (see `models/`)
- Passwords hashed with bcrypt, never returned in queries (`select: false`)
- JWT-protected routes via `middleware/auth.js`
- All queries use Mongoose's built-in parameterization — no string-concatenated queries, so it's not vulnerable to injection the way raw SQL concatenation is (see the brief's SQL Injection slide)
- Unique compound index prevents duplicate reviews (`{ book, user }`)

## Setup

```bash
cd BookTracker
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5002
MONGO_URI=mongodb://localhost:27017/booktracker
JWT_SECRET=<paste output of: openssl rand -base64 32>
```

Start MongoDB locally (or use Atlas and paste the connection string into `MONGO_URI`), then:

```bash
npm start
```

Visit `http://localhost:5002` in your browser.

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Create account (auto-creates 1:1 profile) |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | ✅ | Get current user + profile |
| PUT | /api/auth/profile | ✅ | Update 1:1 profile |
| POST | /api/books | ✅ | Create book |
| GET | /api/books | — | List books (filter by `?genre=` or `?author=`) |
| GET | /api/books/:id | — | Get one book with reviews |
| PUT | /api/books/:id | ✅ | Update book |
| DELETE | /api/books/:id | ✅ | Delete book |
| POST/GET/PUT/DELETE | /api/genres(/:id) | mixed | Genre CRUD |
| POST/GET/PUT/DELETE | /api/reviews(/:id) | mixed | Review CRUD (one per user per book) |

## Notes / possible extensions
- Add pagination on `/api/books`
- Add a "books read" tracker tied to `Profile.booksReadGoal`
- Swap Mongoose for the native MongoDB driver in one route as a comparison exercise (per the brief's Native Drivers vs ORM slide)
