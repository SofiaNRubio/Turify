import { Clerk } from "@clerk/clerk-js";

export const clerk = new Clerk(import.meta.env.PUBLIC_CLERK_FRONTEND_API);

clerk.load();
