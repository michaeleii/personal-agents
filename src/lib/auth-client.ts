import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

export const { signIn, signUp, signOut, useSession, deleteUser } =
  createAuthClient({
    plugins: [anonymousClient()],
  });
