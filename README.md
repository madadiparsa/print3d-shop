# print3d-shop 🖨️

A single-vendor Persian (RTL) e-commerce platform for ready-made and custom 3D-printed products.

Built with **Django REST Framework** (backend) and two separate **React + Vite** frontends (customer storefront & admin panel), styled with **Bootstrap 5 RTL**.

---

## Project Structure

```
print3d-shop/
├── backend/          # Django REST Framework API
├── storefront/       # Customer-facing React app (Vite + Bootstrap 5 RTL)
└── admin-panel/      # Internal admin React app (Vite + Bootstrap 5 RTL)
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | Django 5.x + Django REST Framework |
| Auth | Phone-number OTP + JWT (SimpleJWT) |
| Database (dev) | SQLite |
| Database (prod) | PostgreSQL |
| Task queue | Celery + Redis *(Phase 14)* |
| Media storage | Local / ArvanCloud S3-compatible *(Phase 14)* |
| Server | Gunicorn + Whitenoise *(Phase 14)* |

### Frontend (both apps)
| Layer | Technology |
|---|---|
| Build tool | Vite |
| UI library | React 18 |
| Styling | Bootstrap 5 RTL |
| Font | Vazirmatn (local, no CDN) |
| HTTP client | Axios |
| Routing | React Router v6 |
| State | React Context API |

---

## Features

### Customer Storefront
- 🗂️ Dynamic database-driven product categories
- 🔍 Live search (debounced)
- 🎛️ Advanced sidebar filtering (category, price range, stock)
- 🛒 Shopping cart (add / remove / update quantity)
- 🔐 Phone-number login with mock OTP (demo mode — no SMS sent)
- 👤 User profile & saved addresses
- 📦 Checkout — submits Telegram / Instagram ID for manual order coordination
- 🌙 Light / Dark mode toggle
- 📱 Fully responsive & RTL

### Admin Panel
- 📊 Dashboard with key metrics
- 🏷️ Product & category management (CRUD)
- 📋 Order management with status updates
- ✉️ Contact / support message inbox
- 🔐 Staff-only JWT auth

---

## Development Phases

| Phase | Branch | Description |
|---|---|---|
| 0 | `phase/0-bootstrap` | Repo & tooling setup |
| 1 | `phase/1-django-skeleton` | Django project + models |
| 2 | `phase/2-api-products` | Products & categories API |
| 3 | `phase/3-api-auth` | Phone OTP + JWT auth API |
| 4 | `phase/4-api-cart-orders` | Cart & orders API |
| 5 | `phase/5-storefront-foundation` | Storefront scaffold |
| 6 | `phase/6-storefront-catalog` | Catalog, filtering, search |
| 7 | `phase/7-storefront-auth` | Storefront auth flow |
| 8 | `phase/8-storefront-cart-checkout` | Cart & checkout |
| 9 | `phase/9-storefront-product-detail` | Product detail & custom order |
| 10 | `phase/10-admin-foundation` | Admin panel scaffold |
| 11 | `phase/11-admin-products` | Admin product management |
| 12 | `phase/12-admin-orders` | Admin order & message management |
| 13 | `phase/13-polish-darkmode` | Dark mode, RTL QA, polish |
| 14 | `phase/14-production-prep` | PostgreSQL, Docker, deployment |

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+
- npm 10+
- Git

### Backend setup

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

API will be available at: `http://localhost:8000/api/`
Django admin at: `http://localhost:8000/admin/`

### Storefront setup

```bash
cd storefront
npm install
npm run dev
```

Runs at: `http://localhost:5173`

### Admin panel setup

```bash
cd admin-panel
npm install
npm run dev
```

Runs at: `http://localhost:5174`

---

## Environment Variables

Copy `.env.example` to `.env` in each sub-project and fill in the values.
Full documentation of all variables is provided in Phase 14.

```bash
cp backend/.env.example backend/.env
cp storefront/.env.example storefront/.env
cp admin-panel/.env.example admin-panel/.env
```

---

## Git Workflow

Each development phase lives in its own branch.
No code is merged to `main` without explicit confirmation.

```bash
# Start a new phase
git checkout -b phase/N-description

# Commit convention
git commit -m "feat(phase-N): description of what was done"

# Merge to main after confirmation
git checkout main
git merge phase/N-description
```

---

## Order Workflow (Demo)

This demo version does **not** integrate a payment gateway.

1. Customer adds products to cart
2. Customer logs in with phone number (mock OTP in demo)
3. At checkout, customer enters their **Telegram ID** or **Instagram ID**
4. Order is saved with status `pending`
5. Customer is shown a message to contact the store via Telegram/Instagram to finalize payment and shipping
6. Admin confirms and updates order status manually via the admin panel

---

## Notes

- All services used are **Iran-accessible** (no filtered external APIs)
- Fonts are **bundled locally** (no Google Fonts CDN)
- SMS gateway integration is **prepared but inactive** in demo mode — plug in Kavenegar or Farazsms in production
- Media files use **local storage** in development; swap to ArvanCloud Object Storage in production

---

## License

Private project — all rights reserved.