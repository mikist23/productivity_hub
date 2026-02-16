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

## Multi-Method Donations (Hosted First)

To enable the support experience (`/support`) with hosted payment links, set:

```env
NEXT_PUBLIC_DONATION_MODE=hosted
NEXT_PUBLIC_BUY_ME_A_COFFEE_URL=https://buymeacoffee.com/<your-handle>
NEXT_PUBLIC_PAYPAL_ME_URL=https://paypal.me/<your-handle>
NEXT_PUBLIC_STRIPE_PAYMENT_LINK=https://buy.stripe.com/<your-link>
```

Optional local bank transfer display fields:

```env
NEXT_PUBLIC_BANK_NAME=Your Bank
NEXT_PUBLIC_BANK_ACCOUNT_NAME=Your Name
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=0123456789
NEXT_PUBLIC_BANK_SWIFT=ABCDEF12
NEXT_PUBLIC_BANK_REFERENCE_NOTE=Use your email as transfer reference
```

If a hosted link variable is missing/invalid, that specific payment method is hidden.

### Phase 2 API mode (server-side orchestration)

When you are ready, switch to `NEXT_PUBLIC_DONATION_MODE=api` and configure server secrets:

```env
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
MPESA_WEBHOOK_SECRET=...
AIRTM_WEBHOOK_SECRET=...
BANK_TRANSFER_REFERENCE_SECRET=...
```

API routes added:
- `GET /api/payments/methods`
- `POST /api/payments/create-intent`
- `POST /api/payments/webhooks/:provider`
- `POST /api/payments/bank/submit-proof`

## AI Assistant (Dashboard Chatbot)

The dashboard includes an AI assistant widget fixed in the bottom-right corner.

Scope and behavior:
- Available on dashboard routes.
- Q&A guidance only (does not create/update/delete data).
- Grounded on known app routes and features.
- Session-only chat history.

Required environment variables:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

`GEMINI_BASE_URL` is optional. If missing, the app defaults to:
`https://generativelanguage.googleapis.com/v1beta/openai/`

API endpoint:
- `POST /api/assistant/chat`
- Request body: `messages: Array<{ role: "user" | "assistant"; content: string }>`
- Response: `{ reply: string, model: string }` or `{ error: string }`

Known limitations:
- No direct app actions from chat.
- Answers are constrained to implemented app capabilities.
- Free-tier Gemini usage can hit quota/rate limits.

### Gemini API Key Runbook

1. Open Google AI Studio: `https://aistudio.google.com/`
2. Sign in and open API keys.
3. Create a key in your Google project.
4. Copy the key (`AIza...`).
5. In local `my-app/.env.local`, set:

```env
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

6. Restart local dev server after env changes.
7. In Vercel: Project -> Settings -> Environment Variables.
8. Add the same 3 variables for `Development`, `Preview`, and `Production`.
9. Redeploy after saving vars.
10. Validate in app: log in, open assistant, ask `hello`.
11. If it fails, inspect `/api/assistant/chat` JSON error for exact category (quota, auth, model).

### Billing and Quota Notes

- Gemini may allow limited free-tier usage, but not unlimited.
- If you get 429 responses, check usage limits/quota in AI Studio / Google Cloud billing.

Manual UI QA checklist:
- Open/close launcher on desktop and mobile.
- Send message, verify optimistic user message and assistant reply.
- Clear chat resets panel state.
- Confirm widget remains below critical modal stack (`z-[100]`).

## Optional Footer Social Links

To show social buttons in the landing footer, configure any of these:

```env
NEXT_PUBLIC_SOCIAL_GITHUB_URL=https://github.com/<your-handle>
NEXT_PUBLIC_SOCIAL_X_URL=https://x.com/<your-handle>
NEXT_PUBLIC_SOCIAL_LINKEDIN_URL=https://www.linkedin.com/in/<your-handle>
```

If a social URL is missing or invalid, that social button is hidden automatically.

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
