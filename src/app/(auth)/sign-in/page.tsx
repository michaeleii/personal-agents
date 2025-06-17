import { auth } from "@/lib/auth";
import SignInCard from "../_components/sign-in-card";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/meetings");
  }

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 p-4">
      <SignInCard />
      <div className="text-muted-foreground *:[a]:hover:text-primary/70 *:[a]:text-primary text-center text-xs text-balance">
        By continuing, you agree to our {""}
        <a href="#">Terms of Conditions</a> and {""}
        <a href="#">Privacy Policy</a>
      </div>
    </div>
  );
}
