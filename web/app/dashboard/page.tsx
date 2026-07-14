'use server';

import { DashboardContent } from "@/components/sections/Panel/dashboardContent";
import { getAllProjectsAction } from "@/lib/actions/projects";

export default async function Dashboard() {
    const data = await getAllProjectsAction();

    return (
        <>
            <DashboardContent data = {data} />
        </>
    )
}