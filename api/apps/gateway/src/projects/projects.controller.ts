import { Controller, Inject, Get, UseGuards, Post, Body, Param } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices/client/client-proxy";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProjectDto } from "./dto/createProjectDto";
import { UpdateProjectDto } from "./dto/updateProjectDto";

@Controller('projects') 
export class ProjectsController {
    constructor(
        @Inject('PROJECTS_CLIENT') private readonly projectsClient: ClientProxy
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllProjects() {
        return this.projectsClient.send('projects.getAll', {});
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getProjectById(@Param('id') id: string) {
        return this.projectsClient.send('projects.getById', { id });
    }

    @UseGuards(JwtAuthGuard)
    @Post('create-new-project')
    async createNewProject(@Body() projectData: CreateProjectDto) {
        return this.projectsClient.send('projects.create', projectData);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/update')
    async updateProject(@Param('id') id: string, @Body() projectData: UpdateProjectDto) {
        return this.projectsClient.send('projects.update', { id, dto: projectData });
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/delete')
    async deleteProject(@Param('id') id: string) {
        return this.projectsClient.send('projects.delete', { id });
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/invite')
    async invite(@Param('id') id: string, @Body('email') email?: string) {
        return this.projectsClient.send('projects.generateInviteLink', { projectId: id, invitedEmail: email });
    }
}