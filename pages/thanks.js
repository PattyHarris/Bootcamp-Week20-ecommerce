import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Thanks() {
  const router = useRouter();
  const [isError, setIsError] = useState(false);

  const { session_id } = router.query;

  useEffect(() => {
    const call = async () => {
      try {
        let response = await fetch("/api/stripe/success", {
          method: "POST",
          body: JSON.stringify({
            session_id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status == 200) {
          console.log("First pass is working!");
        } else {
          console.log("Second pass throws an error");
        }
      } catch (error) {
        console.log("Error: " + error);
        setIsError(true);
      }
    };

    if (session_id && !isError) {
      call().then(() => {
        router.push("/thanks");
      });
    }
  }, [session_id, router, isError]);

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
