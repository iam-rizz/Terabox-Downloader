This is a [Next.js](https://nextjs.org) project for downloading files from Terabox sharing links.

## 🚀 Features

- Extract direct download links from Terabox URLs
- Support for multiple Terabox domains
- Beautiful, responsive UI
- Real-time processing status
- Multiple file format support
- Copy download links to clipboard

## ⚙️ Setup & Configuration

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Get your Terabox cookie:
   - Go to [https://www.terabox.com/](https://www.terabox.com/) in your browser
   - Log in to your Terabox account
   - Open Developer Tools (F12)
   - Go to Application/Storage → Cookies → https://www.terabox.com
   - Copy all cookie values
   - Paste them in `.env.local` as `TERABOX_COOKIE`

3. Example `.env.local`:
```env
TERABOX_COOKIE=BAIDUID=xxx; BIDUPSID=xxx; PSTM=xxx; PANWEB=1; csrfToken=xxx; ndus=xxx; ndut_fmt=xxx; STOKEN=xxx
```

### 3. Run the Development Server

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

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
