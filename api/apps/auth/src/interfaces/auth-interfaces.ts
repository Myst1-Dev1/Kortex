export interface SignUpResponse {
    name: string;
    email: string;
    password: string;
    avatarUrl?: string;
}

export interface SignInResponse {
    email: string;
    password: string;
}

export interface RefreshTokenResponse {
    refreshToken: string;
}

export interface OAuthSignInPayload {
    provider: string;
    providerAccountId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
    emailVerified: boolean;
}