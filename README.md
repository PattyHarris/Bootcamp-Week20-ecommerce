# E-Commerce Site

This project sets up an e-commerce website that sells physical items.

There will be an admin portal where products are added. The front end will display items for sale. The site includes a basic cart that will persist across page loads. Users can items multiple times to increase the quantity of an item.

Payment is made via Stripe. Users will receive an email confirming their order - sellers will also receive an email indicating that an item has been sold.

The order will be stored in the database.

This site will not: - include an admin interface to see all orders - manage taxes - include multiple categories of products on individual pages - calculate shipping rates - include a separate page for each product

The main idea here is to have the shopping cart.

The final project can be found here:
https://github.com/flaviocopes/bootcamp-2022-week-20-ecommerce

## Initial Setup

As with the other projects:

    - set up an empty Next.js app
      - npx create-next-app@latest localreviews
    - allow absolute imports for modules
      - jsconfig.json
    - add Tailwind CSS
      - npm install -D tailwindcss postcss autoprefixer
      - npx tailwindcss init -p)
      - add configuration to 'tailwind.config.js' and 'styles/globals.css'.
    - create a PostgreSQL database and configure the '.env' file.
    - install Prisma
      - npm install -D prisma
      - npx prisma init)
    - setup authentication:
      - Generate a new secret (https://generate-secret.vercel.app/32)
      - npm install next-auth pg @next-auth/prisma-adapter nodemailer
      - Add the following to the .env file:
            EMAIL_SERVER=smtp://user:pass@smtp.mailtrap.io:465
            EMAIL_FROM=Your name <you@email.com>
            NEXTAUTH_URL=http://localhost:3000
            SECRET=<ENTER A UNIQUE STRING HERE>
      - Create the [...nextauth].js file in '/pages/api/auth' (this week's change is an 'isAdmin' flag for the user).
      - Add the usual models to the 'prisma/schema.prisma' file (e.g. VerificationRequest, Account, Session, and User).  This weeks schema includes an 'isAdmin' flag for the user.
        - Be sure to run: npx prisma migrate dev
      - Refactor 'pages/_app.js' to use the 'SessionProvider'.

Note: Use the following to generate the new secret:
https://generate-secret.vercel.app/32

And lastly, refactor 'index.js' to contain minimal content:

```
        import Head from 'next/head'

        export default function Home() {
        return (
            <div>
            <Head>
                <title>Blog</title>
                <meta name='description' content='Blog' />
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <h1>Welcome!</h1>
            </div>
        )
        }
```

## Create the Admin Page

1. We won't have a physical user interface element to allow users to login - it is assumed the admin will use 'http://localhost:3000/api/auth/signin' to login (meaning, the admin will need to know URL). After you login, we'll have a session in the database, but we still need to manually set the 'isAdmin' flag on the user.
2. Flavio points to this URL (https://next-auth.js.org/configuration/callbacks#sign-in-callback) that can be used to restrict who can login....
3. Add the 'pages/admin.js' (and then assuming you have a session and have changed the 'isAdmin' flag, you can access the page at 'http://localhost:3000/admin')
