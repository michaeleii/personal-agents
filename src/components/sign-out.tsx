"use client";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { deleteUser, signOut } from "@/lib/auth-client";
export default function SignOut({
  isAnonymous,
}: {
  isAnonymous?: boolean | null;
}) {
  const router = useRouter();
  return (
    <Button
      className="w-full"
      onClick={async () => {
        if (isAnonymous) {
          await deleteUser({
            callbackURL: "/sign-in",
            fetchOptions: {
              onSuccess: () => {
                router.refresh();
              },
            },
          });
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
