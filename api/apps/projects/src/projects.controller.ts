import { Body, Controller } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MessagePattern } from '@nestjs/microservices';
import { CreateProjectDto } from './dto/createProjectDto';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern('service.ping')
    ping() {
      return this.projectsService.ping();
  }

  @MessagePattern('projects.create')
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(dto);
  }
}
