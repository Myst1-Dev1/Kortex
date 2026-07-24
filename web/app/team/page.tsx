'use server';

import { TeamContent } from "@/components/sections/TeamContent";
import { getAllProjectsAction } from "@/lib/actions/projects";
import { cookies } from "next/headers";

export default async function TeamPage() {
    const data = await getAllProjectsAction();
    const projects = data.success ? (data.data ?? []) : [];

    const cookieStore = await cookies();
    const userRaw = cookieStore.get("user")?.value;
    const currentUser = userRaw ? JSON.parse(userRaw) : null;

    const membersMap = new Map<string, { id: string; name: string; email: string; avatarUrl?: string; projects: { id: string; name: string }[] }>();

    for (const project of projects) {
        const participants = (project as any).participants ?? [];
        for (const p of participants) {
            if (!p?.id) continue;
            if (currentUser && p.id === currentUser.id) continue;

            const existing = membersMap.get(p.id);
            if (existing) {
                existing.projects.push({ id: project.id, name: project.name });
            } else {
                membersMap.set(p.id, {
                    id: p.id,
                    name: p.name,
                    email: p.email,
                    avatarUrl: p.avatarUrl,
                    projects: [{ id: project.id, name: project.name }],
                });
            }
        }
    }

    const members = Array.from(membersMap.values());

    return <TeamContent members={members} />;
}
