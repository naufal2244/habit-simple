# HabitTracker Cloud

Proyek Next.js terpisah untuk landing page, Clerk authentication, dan Neon Postgres.

## Arsitektur

- **Auth:** Clerk. Login Google diaktifkan dari dashboard Clerk.
- **Database:** Neon Postgres dengan Drizzle ORM.
- **Hosting:** Vercel sebagai project baru.
- **Build tanpa env:** Tetap berhasil dan menampilkan status setup, sehingga provisioning dapat dilakukan setelah project dibuat.

## Setup Vercel Project Baru

Jalankan langkah berikut secara berurutan. Jangan menjalankan migrasi sebelum env sudah ditarik.

```bash
npx vercel login
npx vercel link
```

Saat `vercel link`, pilih **Create a new project** dan gunakan nama baru, misalnya `habit-tracker-cloud`.

Provision integrasi lewat Vercel Marketplace:

```bash
npx vercel integration add clerk
npx vercel integration add neon
npx vercel env pull .env.local --yes
```

Pastikan `.env.local` memiliki nama key berikut tanpa mencetak nilainya:

```text
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
DATABASE_URL
```

Setelah env lengkap:

```bash
npm run db:push
npm run dev
```

## Google Login

Di dashboard Clerk, buka konfigurasi Social Connections dan aktifkan Google. Untuk development, Clerk menyediakan alur setup yang sederhana. Untuk production, gunakan OAuth credentials milik project Google agar branding dan consent screen menggunakan aplikasi sendiri.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run db:generate
npm run db:push
```

Schema awal tersedia di `src/db/schema.ts`. Migrasi belum dijalankan karena `DATABASE_URL` belum diprovision.
