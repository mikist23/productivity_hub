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

## MongoDB Setup

This project stores dashboard data and authentication data in MongoDB.

1. Add the following environment variables in `.env.local`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
MONGODB_DB=productivity_hub
```

2. Restart the dev server.
3. Sign in and use the dashboard normally. Data is loaded from and saved to MongoDB through `/api/dashboard`.

## Optional Support CTA (Buy Me a Coffee)

To enable the "Buy me a coffee" button in the landing page and app navigation, set:

```env
NEXT_PUBLIC_BUY_ME_A_COFFEE_URL=https://buymeacoffee.com/<your-handle>
```

If this variable is missing or invalid, the support button is hidden automatically.

## Smart Roadmap Source Loading

Goal roadmap import now supports smart URL generation from goal titles.  
Examples:

- `Master Python` + `Load from W3Schools` => auto-generates a W3Schools Python URL and fetches steps.
- `Learn Swift` + `Load from roadmap.sh` => auto-generates a roadmap.sh Swift URL and fetches steps.

If no skill keyword is detected, the app shows a quick skill picker and then generates the source URL automatically.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
