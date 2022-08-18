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
3. There should be checks for no image in the display - although I did add a 'No Image Available' png to the project which works just as well....

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

## Add Cart Functionality

1. In 'pages/index.js', add a button to each item to enable 'add to cart'. When the button is clicked, the item will appear in the 'cart' that will show above the items.
2. Add 'cart' and 'setCart' in a 'useState' where 'cart' is a collection of products. When the 'add' button is clicked, the product will be added to the cart. Later in the steps, the display of items in the cart is refactored to not show multiples of the same product but instead show the product with its count:

```
                <button
                  className='mb-4 mx-auto bg-black text-white px-3 py-1 text-lg'
                  onClick={() => {
                    const itemsInCartWithThisId = cart.filter((item) => {
                      return item.product.id === product.id
                    })

                    if (itemsInCartWithThisId.length > 0) {
                      setCart([
                        ...cart.filter((item) => {
                          return item.product.id !== product.id
                        }),
                        {
                          product: itemsInCartWithThisId[0].product,
                          quantity: itemsInCartWithThisId[0].quantity + 1,
                        },
                      ])
                    } else {
                      setCart([...cart, { product, quantity: 1 }])
                    }
                  }}
                >
                  Add to cart
                </button>

```

3. The cart JSX is then modified to make it more visually interesting.

## Persist the Cart Across Browser Reloads

1. The cart data will be stored locally in the browser local storage. We'll be using a library 'localForage'. This library abstracts away the browser storage, allowing us to store objects and arrays in local storage.
2. The library internally uses a 'indexedDB' library for the storing data and that DB is made available to users - see below. The primary reason for this is that in the scenario, the user that purchases products are not required to have accounts.
3. Install the library:

```
npm i localforage
```

4. We'll save the cart to local storage by listening to changes in the cart:

```

useEffect(() => {
  localForage.setItem('cart', cart)
}, [cart])
```

5. We can also the cart contents when the component is loaded using another 'useEffect':

```
useEffect(() => {
  localForage.getItem('cart', function (err, value) {
    if (value) {
      setCart(value)
    }
  })
}, [])
```

6. To manually delete the cart contents, open the 'DevTools Application' tab and delete the 'localforage' 'IndexedDB' database. But we'll add a 'clear cart' button anyway:

```
            <button
              className='mx-auto bg-black text-white px-3 py-1 my-4 text-sm justify-center flex'
              onClick={() => setCart([])}
            >
              Clear cart
            </button>

```

## Implement Checkout using Stripe Checkout

1. First install the Stripe libraries:

```
npm i @stripe/react-stripe-js @stripe/stripe-js stripe
```

2. As before, make sure the .env is setup with the Stripe keys:

```
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
BASE_URL=http://localhost:3000
```

3. Add a 'Go to Checkout' button to the cart area of 'pages/index.js'.
4. As in prior lessons, we need to first setup a session with Stripe. When we click on the "go to checkout' button, we send a post request to 'pages/api/stripe/session.js'. Here, one of the differences this week is that we need Stripe to collect the customer shipping address - that's done with 'shipping_address_collection':

```
.....
  const stripe_session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "IT"], //add our country ISO code
    },
    line_items: req.body.cart.map((item) => {
      return {
        name: item.product.title,
        amount: item.product.price,
        currency: "usd",
        quantity: item.quantity,
      };
    }),
    success_url:
      process.env.BASE_URL + "/thanks?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: process.env.BASE_URL + "/cancelled",
  });
.....
```

The response contains the Stripe session ID and the Stripe public key (both needed by the frontend).

5. In 'pages/index.js', import the Stripe script as we have done previously.
6. In the button 'onClick' handler, initialize the redirect to Stripe and clear the cart.
7. Add a 'thanks' and 'cancelled' page.
8. In 'pages/thanks.js', we once again make the page server-side so we can access the router query data - here we need the session ID (from Stripe). Here we're also going to send the session ID to a '/api/stripe/success' route where the rest of the application logic related to the orders is handled.

