import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RedisService } from 'libs/redis/src';
import { Tasks } from './entities/tasks.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/uploaad-task.dto';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    
    private readonly CACHE_TTL = 3600;

    constructor(
      private readonly redisService: RedisService,
    
      @InjectRepository(Tasks)
          private readonly tasksRepository: Repository<Tasks>,
    ) {}

    ping() {
      return {
        ok: true,
        service: 'tasks',
        now: new Date().toISOString(),
      };
    }

    async create(dto: CreateTaskDto) {
      this.logger.log(`Tentando criar uma nova task: ${JSON.stringify(dto)}`);

      const task = this.tasksRepository.create({
        ...dto,
        status: 'PENDING',
      });

      await this.tasksRepository.save(task);

      await this.redisService.del(
        `tasks:project:${task.project_id}`,
      );

      return task;
    }

    async findByProject(projectId: string) {
      this.logger.log(`Buscando tasks do projeto ${projectId}`);

      const cacheKey = `tasks:project:${projectId}`;

      const cached = await this.redisService.get<Tasks[]>(cacheKey);

      if (cached) {
        this.logger.debug(`Tasks do projeto ${projectId} encontradas no cache.`);
        return cached;
      }

      const tasks = await this.tasksRepository.find({
        where: {
          project_id: projectId,
        },
        order: {
          created_at: 'DESC',
        },
      });

      await this.redisService.set(
        cacheKey,
        tasks,
        this.CACHE_TTL,
      );

      this.logger.debug(`Tasks do projeto ${projectId} armazenadas no cache.`);

      return tasks;
    }

    async findOne(id: string) {
      this.logger.log(`Tentando buscar a task com id: ${id}`);

      const cacheKey = `tasks:${id}`;

      const cachedTask = await this.redisService.get<Tasks>(cacheKey);

      if (cachedTask) {
        this.logger.debug(`Task ${id} encontrada no cache.`);
        return cachedTask;
      }

      const task = await this.tasksRepository.findOne({
        where: { id },
      });

      if (!task) {
        throw new NotFoundException('Task não encontrada');
      }

      await this.redisService.set(cacheKey, task, this.CACHE_TTL);

      this.logger.debug(`Task ${id} armazenada no cache.`);

      return task;
    }

    async update(
      id: string,
      userId: string,
      dto: UpdateTaskDto,
    ) {
      this.logger.log(`Tentando atualizar a task com id: ${id} e dados: ${JSON.stringify(dto)}`);

      const task = await this.findOne(id);

      if (task.task_author_id !== userId) {
        throw new ForbiddenException(
          'Somente o criador da tarefa pode editá-la.',
        );
      }

      Object.assign(task, dto);

      await this.tasksRepository.save(task);

      await this.redisService.del(`tasks:${id}`);

      await this.redisService.del(
        `tasks:project:${task.project_id}`,
      );

      return task;
    }

    async updateStatus(
      id: string,
      userId: string,
      status: string,
      time_concluded?: string,
    ) {
      this.logger.log(`Tentando atualizar o status da task com id: ${id} para ${status}`);

      const task = await this.findOne(id);

      if (task.assigned_user_id !== userId) {
        throw new ForbiddenException(
          'Você não é o responsável por esta tarefa.',
        );
      }

      task.status = status;

      if (time_concluded) {
        task.time_concluded = time_concluded;
      }

      await this.tasksRepository.save(task);

      await this.redisService.del(`tasks:${id}`);

      await this.redisService.del(
        `tasks:project:${task.project_id}`,
      );

      return task;
    }

    async remove(id: string, userId: string) {
      this.logger.log(`Tentando remover a task com id: ${id}`);
      
      const task = await this.findOne(id);

      if (task.task_author_id !== userId) {
        throw new ForbiddenException(
          'Somente o criador pode excluir esta tarefa.',
        );
      }

      await this.tasksRepository.remove(task);

      await this.redisService.del(`tasks:${id}`);

      await this.redisService.del(
        `tasks:project:${task.project_id}`,
      );

      return {
        message: 'Task removida com sucesso.',
      };
    }
}
