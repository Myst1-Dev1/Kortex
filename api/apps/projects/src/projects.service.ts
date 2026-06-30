import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'libs/redis/src';
import { Projects } from './entities/projects.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/createProjectDto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);
  
  constructor(
    private readonly redisService: RedisService,
  
    @InjectRepository(Projects)
        private readonly projectsRepository: Repository<Projects>,
  ) {}

   ping() {
    return {
      ok: true,
      service: 'projects',
      now: new Date().toISOString(),
    };
  }

  async createProject(createProjectDto: CreateProjectDto): Promise<Projects> {
    this.logger.log(`Tentando criar projeto para o autor: ${createProjectDto.author_id}`);

    try {
      const projectInstance = this.projectsRepository.create(createProjectDto);
      const savedProject = await this.projectsRepository.save(projectInstance);

      this.logger.log(`Projeto criado com sucesso! ID: ${savedProject.id}`);
      
      return savedProject;
    } catch (error: any) {
      this.logger.error(
        `Falha ao criar projeto para o autor ${createProjectDto.author_id}. Erro: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Erro ao tentar criar o projeto. Tente novamente mais tarde.',
      );
    }
  }
}
