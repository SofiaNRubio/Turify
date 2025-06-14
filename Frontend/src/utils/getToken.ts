import { useStore } from "@nanostores/react";
import { $authStore } from "@clerk/astro/client";

export default function UserProfile() {
    const { userId } = useStore($authStore);

    if (userId === undefined) {
        return <div>Loading...</div>;
    }

    if (userId === null) {
        return <div>Please sign in to view your profile.</div>;
    }

    // Aquí puedes realizar una solicitud al servidor para obtener el token de sesión
    // fetch('/api/me').then(response => response.json()).then(data => console.log(data));

    return <div>Welcome, {userId}!</div>;
}
