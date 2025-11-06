The beginnings of my home inventory self hosted app, several years ago my apartment was broken into and most of my possesions were stolen. I learned from this experience that insurance companies want a lot of information that I doubt most of us bother to keep about the major purchases in our lives. Tracking down that data over the next few days for my insurance claim I built several spreadsheets collecting that data together.

Afterwards my insurance company suggested that I keep an ongoing inventory of at least my major items, in excess of $50 or so, to simplify this process if it ever happens again and I've suggested to many people in my life they do the same. However the software solutions for this I found were very frustrating, some require a monthly fee more than popular MMOs, some only have a phone app and no way to interact with the DB outside the phone unless you export through some paid service. Keeping it all in just spreadsheets was miserable and very time consuming especially when dealing with images of each item, no spreadsheet is fun to work with on a smartphone. So while I have found a solution I'm happy with for now, this was a little side project I thought I could use to demonstrate my front-end abilities for now and if I ever actually finish it as a project release it as a docker image for people to manage their own home inventories.

I will most likely be leaving CSS and prettification til the last, I can do it but my philosophy has always been function over form. I understand very much that much of what we intuit from any UI is based in form and so form is a part of function but I prefer to get the technical functionality fleshed out first as far as I've concieved of it before worrying about making things look pretty.

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
