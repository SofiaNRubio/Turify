// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/astro/server";

interface UserData {
    private_metadata?: {
        permission?: string;
    };
}

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const onRequest = clerkMiddleware(async (auth, req, next) => {
    // Protege cualquier ruta de /admin
    if (isAdminRoute(req.request)) {
        if (!auth().userId) {
            return Response.redirect("/sign-in");
        }

        const userId = auth().userId;
        let userData: UserData = {};
        try {
            const response = await fetch(
                `https://api.clerk.dev/v1/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                console.error(
                    `Error fetching user data: ${response.status} ${response.statusText}`
                );
                return new Response("Error fetching user data", {
                    status: 500,
                });
            }
            userData = await response.json();
        } catch (error) {
            console.error("Error fetching user data:", error);
            return new Response("Error fetching user data", { status: 500 });
        }

        // Accede al permiso desde la metadata privada
        const permission = userData?.private_metadata?.permission;

        if (permission !== "admin") {
            return new Response("No autorizado", { status: 403 });
        }
    }

    return next();
});
