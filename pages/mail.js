import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Mail() {
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

  return <div></div>;
}

export async function getServerSideProps(context) {
  // This is need to make the router query data available client-side.
  // See https://nextjs.org/docs/api-reference/next/router#router-object
  return {
    props: {},
  };
}
