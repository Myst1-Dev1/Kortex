'use server';

import { getInviteInfoAction } from "@/lib/actions/projects";
import { AcceptInvite } from "@/components/sections/AcceptInvite";

export default async function AcceptInvitePage({ searchParams }: any) {
    const { token } = await searchParams;

    if (!token) {
        return (
            <AcceptInvite 
                token=""
                inviteInfo={null}
                error="Token de convite não fornecido"
            />
        );
    }

    const result = await getInviteInfoAction(token);

    return (
        <AcceptInvite 
            token={token}
            inviteInfo={result.success ? result.data : null}
            error={!result.success ? result.error : null}
        />
    );
}