import { Controller } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IProject } from './interfaces/project-interfaces';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern('service.ping')
    ping() {
      return this.projectsService.ping();
  }

  @MessagePattern('projects.create')
  createProject(@Payload() dto: IProject) {
    return this.projectsService.createProject(dto);
  }

  @MessagePattern('projects.getAll')
  getAllProjects() {
    return this.projectsService.getAllProjects();
  }

  @MessagePattern('projects.getById')
  getProjectById(@Payload() data: { id: string }) {
    return this.projectsService.getProjectById(data.id);
  }

  @MessagePattern('projects.update')
  updateProject(@Payload() data: { dto: IProject, id: string }) {
    return this.projectsService.updateProject(data.id, data.dto);
  }

  @MessagePattern('projects.delete')
  deleteProject(@Payload() data: { id: string }) {
    return this.projectsService.deleteProject(data.id);
  }

  @MessagePattern('projects.generateInviteLink')
  generateInviteLink(@Payload() data: { projectId: string, invitedEmail?: string }) {
    return this.projectsService.generateInviteLink(data.projectId, data.invitedEmail);
  }

  @MessagePattern('projects.acceptInvite')
  acceptInvite(@Payload() data: { token: string, currentUser: { id: string, name: string, email: string, avatarUrl: string | null } }) {
    return this.projectsService.acceptInvite(data.token, data.currentUser);
  }
}
