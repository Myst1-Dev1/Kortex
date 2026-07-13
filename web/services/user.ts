import { parseCookies } from 'nookies';

export interface User {
    name?: string;
    email?: string;
    avatarUrl?: string;
}

export function useUser(): { user: User | null } {
    const cookies = parseCookies();

    const user: User | null = cookies.user
        ? JSON.parse(cookies.user)
        : null;

    return { user };
}
