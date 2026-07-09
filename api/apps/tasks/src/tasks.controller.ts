import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/uploaad-task.dto';

@Controller()
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
  ) {}

  @MessagePattern('service.ping')
  ping() {
    return this.tasksService.ping();
  }

  @MessagePattern('tasks.create')
  create(dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @MessagePattern('tasks.findByProject')
  findAll(projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @MessagePattern('tasks.findOne')
  findOne(id: string) {
    return this.tasksService.findOne(id);
  }

  @MessagePattern('tasks.update')
  update(data: {
    id: string;
    userId: string;
    dto: UpdateTaskDto;
  }) {
    return this.tasksService.update(
      data.id,
      data.userId,
      data.dto,
    );
  }

  @MessagePattern('tasks.updateStatus')
  updateStatus(data: {
    id: string;
    userId: string;
    status: string;
    time_concluded?: string;
  }) {
    return this.tasksService.updateStatus(
      data.id,
      data.userId,
      data.status,
      data.time_concluded,
    );
  }

  @MessagePattern('tasks.delete')
  delete(data: {
    id: string;
    userId: string;
  }) {
    return this.tasksService.remove(
      data.id,
      data.userId,
    );
  }
}