import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

const requireAuth = ClerkExpressRequireAuth({});

app.get("/api/protected", requireAuth, (req, res) => {
    res.json({ message: "Acceso concedido" });
});
