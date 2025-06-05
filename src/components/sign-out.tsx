"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { deleteUser, signOut } from "@/lib/auth-client";
export default function SignOut({ isAnonymous }: { isAnonymous?: boolean }) {
  const router = useRouter();
  return (
    <Button
      className="w-full"
      onClick={async () => {
        if (isAnonymous) {
          await deleteUser({
            callbackURL: "/login",
          });
          router.refresh();
        }
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              router.refresh();
            },
          },
        });
      }}
    >
      Sign Out
    </Button>
  );
}
