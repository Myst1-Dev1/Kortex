'use server';

import { getInviteInfoAction } from "@/lib/actions/projects";
import { AcceptInvite } from "@/components/sections/AcceptInvite";
import { cookies } from "next/headers";

export default async function AcceptInvitePage({ searchParams }: any) {
    const cookie = (await cookies()).get('user')?.value;
        
    const { token } = await searchParams;

    if (!token) {
        return (
            <AcceptInvite 
                cookie={cookie}
                token=""
                inviteInfo={null}
                error="Token de convite não fornecido"
            />
        );
    }

    const result = await getInviteInfoAction(token);

    return (
        <AcceptInvite 
            cookie={cookie}
            token={token}
            inviteInfo={result.success ? result.data : null}
            error={!result.success ? result.error : null}
        />
    );
}