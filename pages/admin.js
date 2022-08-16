import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Admin() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const loading = status === "loading";

  if (loading) {
    return null;
  }

  if (!session) {
    router.push("/");
    return;
  }

  if (!session.user.isAdmin) {
    router.push("/");
    return;
  }

  return (
    <div className="text-center">
      <h1 className="mt-10 font-extrabold text-2xl mb-8">Admin</h1>
    </div>
  );
}
