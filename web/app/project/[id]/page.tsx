'use server';

import { ProjectContent } from "@/components/sections/ProjectContent";
import { getProjectByIdAction } from "@/lib/actions/projects";

export default async function Project({ params }: any) {
    const { id } = await params;

    const data = await getProjectByIdAction(id);

    return (
        <>
            <ProjectContent data = { data } />
        </>
    )
}