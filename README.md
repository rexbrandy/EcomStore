# E-commerce Store

This Project is an Ecommerce Store built with Sveltekit for my final submission to my Full Stack Dev class.
Sveltekit was chosen as the JS framework due to the ease of development and due to my personal preferences towards svelte over React and Vue.
The application currently uses Postgresql for the database and Prisma as the ORM.

Here is a link to the [Demo](https://ecom-store-onga148yn-baileys-projects-dbe4b095.vercel.app/).

### Features

The application has the following features as per the requirements of the project.

* **User Authentication:** Registration, Login, Logout, Session management.
* **Product Catalog:** Browse products by categories, view product details.
* **Shopping Cart:** Add, update quantities, remove items, clear cart.
* **Checkout Process:** Secure order placement, shipping/billing address input, simulated payment.
* **Order Management (Customer):** View personal order history and individual order details.
* **Admin Panel (Role-based access):**
    * Dashboard overview.
    * Manage Products (CRUD, pagination, search, filter, sort).
    * Manage Categories (CRUD).
    * Manage Orders (view all, filter by status, search, update order status).
    * Manage Users (view, edit user details and admin status).

### Application Structure

With in the `./src` folder is the code for back the API and the frontend client.

```
src
├── lib
│   ├── common.ts
│   ├── enums.ts
│   ├── index.ts
│   ├── interfaces.ts
│   ├── layout
│   ├── server
│   └── types.ts
└── routes
    ├── +error.svelte
    ├── +layout.server.ts
    ├── +layout.svelte
    ├── +page.server.ts
    ├── +page.svelte
    ├── account
    ├── admin
    ├── api // API endpoints
    ├── auth
    ├── cart
    ├── category
    ├── checkout
    ├── orders
    └── product
```

### Tech Stack

Technologies used.

* **Frontend:**
    * [SvelteKit](https://kit.svelte.dev/) (Web Framework)
    * [Svelte 5](https://svelte.dev/) (UI Library - if you used Svelte 5 features like `$state`/`$props`)
    * [TypeScript](https://www.typescriptlang.org/) (Type-safe JavaScript)
    * [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework)
* **Backend / ORM:**
    * [Node.js](https://nodejs.org/) (Runtime Environment)
    * [Prisma](https://www.prisma.io/) (ORM for database interaction)
    * [Bcrypt](https://www.npmjs.com/package/bcrypt) (Password hashing)
* **Database:**
    * [PostgreSQL](https://www.postgresql.org/) (Relational Database)
    * [Neon](https://neon.tech/) (Serverless PostgreSQL Database)
* **Deployment:**
    * [Vercel](https://vercel.com/) (Cloud Platform for Serverless Deployments)

### Local Setup

##### Requirements

* **Node.js:** (Specify compatible versions, e.g., `v18.x`, `v20.x`, `v22.x` - *important for Vercel adapter*). You might recommend `nvm` for easy switching.
* **npm** (or pnpm / yarn)
* **Git**

##### Run

To run this project locally just follow the following commands

    ```bash
    git clone https://github.com/rexbrandy/EcomStore.git
    cd EcomStore
    npm install
    
    # DB Setup
    touch .env
    echo 'DATABASE_URL="[POSTGRES_CONN_STRING]"' > .env
    npx prisma migrate deploy
    npx prisma generate
    npm run seed # If you want to generate dummy data

    # Run dev
    npm run dev
    ```


### Admin Panel

**URL:** `/admin`

**Credentials:**
You need a user account in your database with the isAdmin flag set to true.
If you seeded your database, there might be a default admin user.
Otherwise, you can manually update a user's isAdmin status in your Neon database using the SQL editor

**Seed data Admin Credentials:**
Email: Admin@example.com Pass:password123

