import Head from "next/head";

export default function Thanks() {
  return (
    <div>
      <Head>
        <title>Shop</title>
        <meta name="description" content="Shop" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="">
        <h1 className="mt-10 font-extrabold text-4xl text-center">Shop</h1>
        <h3 className="mt-20 py-2 text-2xl text-center">
          Thanks for your order!
        </h3>
        <h3 className="py-2 text-2xl text-center">
          Check your confirmation email
        </h3>
      </div>
    </div>
  );
}
