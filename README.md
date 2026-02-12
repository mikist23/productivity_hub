This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## MongoDB Setup (Data API)

This project now supports cloud persistence for dashboard data through MongoDB Atlas Data API.

1. In MongoDB Atlas, enable **Data API** for your cluster.
2. Create an API key with read/write access.
3. Add the following environment variables in `.env.local`:

```env
MONGODB_DATA_API_URL=https://data.mongodb-api.com/app/<your-app-id>/endpoint/data/v1
MONGODB_DATA_API_KEY=<your-data-api-key>
MONGODB_DATA_SOURCE=Cluster0
MONGODB_DATABASE=productivity_hub
MONGODB_COLLECTION=dashboard_state
```

4. Restart the dev server.
5. Sign in and use the dashboard normally. Data will be loaded from and saved to MongoDB automatically.

If these variables are missing, the app keeps working locally and cloud sync endpoints return `503`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
