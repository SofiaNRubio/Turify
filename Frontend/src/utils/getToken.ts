// Función utilitaria para obtener el token de autenticación
export default function getToken(): string | null {
    // Obtener el token desde localStorage
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth-token') || null;
    }
    return null;
}

// Función para establecer el token
export function setToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', token);
    }
}

// Función para eliminar el token
export function removeToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
    }
}
