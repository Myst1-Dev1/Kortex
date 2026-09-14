import NextAuth from "next-auth";                                        
import Google from "next-auth/providers/google";                         
import GitHub from "next-auth/providers/github";                         
import { cookies } from "next/headers";                                  
                                                                            
const API_URL = process.env.API_URL || "http://localhost:4002/";         
                                                                            
const COOKIE_OPTIONS = {                                                 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,                                              
    path: "/",                                                             
};                                                                       
                                                                            
export const { handlers, signIn, signOut, auth } = NextAuth({            
    trustHost: true,
    providers: [                                                           
    Google({                                                             
        clientId: process.env.GOOGLE_CLIENT_ID,                            
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,                    
    }),                                                                  
    GitHub({                                                             
        clientId: process.env.GITHUB_ID,                                   
        clientSecret: process.env.GITHUB_SECRET,                           
        authorization: { params: { scope: "read:user user:email" } },
    }),                                                                  
    ],                                                                     
    callbacks: {                                                           
    async signIn({ user, account, profile }) {                           
                if (!account || !["google", "github"].includes(account.provider)) {
                    return "/?error=OAuthAccountInvalid";
                }

                let email = user.email;
                                                                            
        // Validação de e-mail verificado para mitigar account takeover    
                let emailVerified = account.provider === "google"
                    ? Boolean((profile as { email_verified?: boolean } | undefined)?.email_verified)
                    : false;

                if (account.provider === "github" && account.access_token) {
                    const githubEmailsResponse = await fetch("https://api.github.com/user/emails", {
                        headers: {
                            Accept: "application/vnd.github+json",
                            Authorization: `Bearer ${account.access_token}`,
                            "X-GitHub-Api-Version": "2022-11-28",
                        },
                    });

                    if (githubEmailsResponse.ok) {
                        const githubEmails = await githubEmailsResponse.json() as Array<{
                            email?: string;
                            primary?: boolean;
                            verified?: boolean;
                        }>;
                        const verifiedEmail = githubEmails.find(
                            (item) => item.verified && item.primary,
                        ) ?? githubEmails.find((item) => item.verified);
                        email = verifiedEmail?.email ?? email;
                        emailVerified = Boolean(verifiedEmail?.email);
                    }
                }

                if (!email || !emailVerified) {
                    return "/?error=OAuthEmailNotVerified";
                }
                                                                            
        try {                                                              
        const response = await fetch(`${API_URL}auth/oauth`, {           
            method: "POST",                                                
            headers: { "Content-Type": "application/json" },               
            body: JSON.stringify({                                         
            provider: account.provider,                                  
            providerAccountId:
              account.providerAccountId ?? account.id ?? user.id,                                                                   
            email,
            name: user.name ?? undefined,                                
            avatarUrl: user.image ?? undefined,                          
            emailVerified,                                               
            }),                                                            
        });                                                              
                                                                            
        if (!response.ok) {                                              
            console.error(                                                 
            "[Auth.js signIn] Falha ao autenticar no Kortex API:",       
            await response.text()                                        
            );                                                             
            return false;                                                  
        }                                                                
                                                                            
        const data = await response.json();                              
        const cookieStore = await cookies();                             
                                                                            
        cookieStore.set("user", JSON.stringify(data.user), {             
            path: "/",                                                     
            secure: process.env.NODE_ENV === "production",
            httpOnly: false,
            sameSite: "lax",                                               
        });                                                              
        cookieStore.set("access_token", data.accessToken, COOKIE_OPTIONS);
        cookieStore.set("refresh_token", data.refreshToken, COOKIE_OPTIONS);                                                           
                                                                            
        return true;                                                     
        } catch (err) {                                                    
        console.error("[Auth.js signIn] Erro de rede ao conectar com backend:", err);                                                           
        return false;                                                    
        }                                                                  
    },                                                                   
    async jwt({ token, user }) {                                         
        if (user) {                                                        
        token.user = user;                                               
        }                                                                  
        return token;                                                      
    },                                                                   
    async session({ session, token }) {                                  
        if (token.user) {                                                  
        session.user = token.user as any;                                
        }                                                                  
        return session;                                                    
    },                                                                   
    },                                                                     
}); 