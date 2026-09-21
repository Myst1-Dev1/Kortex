'use server';

import { ProjectContent } from "@/components/sections/ProjectContent";
import { getProjectByIdAction } from "@/lib/actions/projects";
import { getTasksByProjectAction } from "@/lib/actions/tasks";
import { cookies } from "next/headers";

export default async function Project({ params }: any) {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    const data = await getProjectByIdAction(id);

    const tasks = await getTasksByProjectAction(id);

    return (
        <>
            <ProjectContent data = { data } tasks = {tasks} token = {token} />
        </>
    )
}