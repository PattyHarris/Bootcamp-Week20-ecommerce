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
2. Flavio points to this URL (https://next-auth.js.org/configuration/callbacks#sign-in-callback) that discusses how to restrict who can login....
3. Add the 'pages/admin.js' (and then assuming you have a session and have changed the 'isAdmin' flag, you can access the page at 'http://localhost:3000/admin')

## Allow the Admin to Add Products

1. Add the 'Product' model to the database (and run 'npx prisma migrate dev'). Note that the 'Product' includes an image.
2. On 'pages/admin.js', add a button that enables the addition of a product - the button directs the user to 'pages/admin/new.js'.
3. Now that we have an 'admin' folder, Flavio moves 'admin.js' to 'admin/index.js'. The url for the admin page, 'http://localhost:3000/admin' still is the same.
4. Add the form to 'pages/admin/new.js'.
   1. The pattern on the price ensures that the price includes a '.'.
   2. A product can only be added if there is a title and a price.
   3. For images: "We don’t handle image uploads but we’ll ask admins to first put the image in the /public folder and put the file name in an input field, which will be relative to the site’s current domain." - this means that we're using the names of image files - e.g. 'public/bikeShoes.jpeg'.
5. The endpoint to handle the database request is 'pages/api/product.js'. Here, only admins can save products. Note also that the price is multiplied by 100 so we're not storing fractions.
6. After saving the product, the admin is redirected back to the admin page where we'll show the products saved. Add 'data.js' to lib and add 'getProducts'.
7. Import the new function in 'pages/admin/index.js' (which was 'pages/admin.js') along with 'prisma'. The latter is needed for 'getServerSideProps'.

At this point, you can enter products.

## Display the Products on the Home Page

1. To start we'll just copy what we did on the 'pages/admin/index.js'.
2. Then, to make it 'prettier', the layout is modified to make it 2 columns when the screen is large, and add the product image and description.
3. There should be checks for no image in the display:

```
              <div>
                {product.image && (
                  <Image
                    src={`/` + product.image}
                    width={"600"}
                    height={"600"}
                    alt={product.title}
                  />
                )}
              </div>


```

This seems to work - if there's no image, the product title and description still appear on the right.
