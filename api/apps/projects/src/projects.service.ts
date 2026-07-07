import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from '../../../libs/redis/src/redis.service';
import { Projects } from './entities/projects.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { IParticipants, IProject } from './interfaces/project-interfaces';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  private readonly CACHE_KEY = 'projects:all';
  private readonly CACHE_TTL = 3600;
  
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  
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

  async getAllProjects(): Promise<Projects[]> {
    this.logger.log('Tentando buscar todos os projetos');

    try {
      // 1. Tenta buscar do cache do Redis
      const cachedProjects:any = await this.redisService.get(this.CACHE_KEY);
      if (cachedProjects) {
        this.logger.log('Projetos recuperados do cache Redis.');
        return JSON.parse(cachedProjects);
      }

      // 2. Se não tiver no cache, busca no banco
      const projects = await this.projectsRepository.find();
      this.logger.log(`Foram encontrados ${projects.length} projetos no banco de dados.`);

      // 3. Salva no Redis para as próximas requisições
      await this.redisService.set(this.CACHE_KEY, JSON.stringify(projects), this.CACHE_TTL);
      
      return projects;
    } catch (error: any) {
      this.logger.error(
        `Falha ao buscar todos os projetos. Erro: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Erro ao tentar buscar os projetos. Tente novamente mais tarde.',
      );
    }
  }

  async getProjectById(id: string): Promise<Projects> {
    this.logger.log(`Tentando buscar projeto com ID: ${id}`);
    const cacheKey = `projects:${id}`;

    try {
      // 1. Tenta buscar do cache do Redis
      const cachedProject:any = await this.redisService.get(cacheKey);
      if (cachedProject) {
        this.logger.log(`Projeto com ID ${id} recuperado do cache Redis.`);
        return JSON.parse(cachedProject);
      }

      // 2. Se não tiver no cache, busca no banco
      const project = await this.projectsRepository.findOne({ where: { id } });

      if (!project) {
        this.logger.warn(`Projeto com ID ${id} não encontrado.`);
        throw new NotFoundException(`Projeto com ID ${id} não encontrado.`);
      }

      // 3. Salva no Redis
      this.logger.log(`Projeto com ID ${id} encontrado no banco. Salvando no cache.`);
      await this.redisService.set(cacheKey, JSON.stringify(project), this.CACHE_TTL);

      return project;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Falha ao buscar projeto com ID ${id}. Erro: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Erro ao tentar buscar o projeto. Tente novamente mais tarde.',
      );
    }
  }

  async createProject(data: IProject): Promise<Projects> {
    this.logger.log(`Tentando criar projeto para o autor: ${data.author_id}`);

    try {
      const projectInstance = this.projectsRepository.create(data);
      const savedProject = await this.projectsRepository.save(projectInstance);

      this.logger.log(`Projeto criado com sucesso! ID: ${savedProject.id}`);
      
      return savedProject;
    } catch (error: any) {
      this.logger.error(
        `Falha ao criar projeto para o autor ${data.author_id}. Erro: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Erro ao tentar criar o projeto. Tente novamente mais tarde.',
      );
    }
  }

  async updateProject(id: string, data: IProject): Promise<Projects> {
    this.logger.log(`Tentando atualizar projeto com ID: ${id}`);

    try {
      const project = await this.projectsRepository.findOne({ where: { id } });

      if (!project) {
        this.logger.warn(`Projeto com ID ${id} não encontrado.`);
        throw new NotFoundException(`Projeto com ID ${id} não encontrado.`);
      }

      const updatedProject = Object.assign(project, data);
      const savedProject = await this.projectsRepository.save(updatedProject);

      this.logger.log(`Projeto atualizado com sucesso! ID: ${savedProject.id}`);
      
      return savedProject;
    } catch (error: any) {
      this.logger.error(
        `Falha ao atualizar projeto com ID ${id}. Erro: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Erro ao tentar atualizar o projeto. Tente novamente mais tarde.',
      );
    }
  }

  async deleteProject(id: string): Promise<void> {
    this.logger.log(`Tentando deletar projeto com ID: ${id}`);

    try {
      const project = await this.projectsRepository.findOne({ where: { id } });

      if (!project) {
        this.logger.warn(`Projeto com ID ${id} não encontrado.`);
        throw new NotFoundException(`Projeto com ID ${id} não encontrado.`);
      }

      await this.projectsRepository.remove(project);
      this.logger.log(`Projeto deletado com sucesso! ID: ${id}`);
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Falha ao deletar projeto com ID ${id}. Erro: ${error.message}`,
        error.stack,
      );

      throw new InternalServerErrorException(
        'Erro ao tentar deletar o projeto. Tente novamente mais tarde.',
      );
    }
  }

  async generateInviteLink(projectId: string, invitedEmail?: string): Promise<string> {
    this.logger.log(`Gerando link de convite para o projeto ID: ${projectId}`);

    // 1. Verifica se o projeto realmente existe antes de gerar o link
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException(`Projeto com ID ${projectId} não encontrado.`);
    }

    // 2. Cria o payload do token. 
    // Colocamos o projectId e, se enviado, o e-mail do usuário alvo.
    const payload = { 
      projectId, 
      invitedEmail: invitedEmail || null,
      purpose: 'project_invitation' // Garante que o token só sirva para isso
    };

    // 3. Gera o token com um tempo de expiração (ex: 2 dias)
    // Nota: Configure sua JWT_SECRET nas variáveis de ambiente (.env)
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'sua_chave_secreta_fallback',
      expiresIn: '2d', 
    });

    // 4. Monta a URL que aponta para o seu Front-end (onde o usuário vai clicar)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const inviteLink = `${frontendUrl}/projects/accept-invite?token=${token}`;

    return inviteLink;
  }

  async acceptInvite(token: string, currentUser: { id: string, name: string, email: string, avatarUrl: string | null }): Promise<Projects> {
    this.logger.log(`Usuário ${currentUser.id} tentando aceitar convite via token.`);

    let payload: any;

    // 1. Valida o Token JWT (Verifica assinatura e expiração automaticamente)
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'sua_chave_secreta_fallback',
      });
    } catch (error:any) {
      this.logger.warn(`Token de convite inválido ou expirado. Erro: ${error.message}`);
      throw new BadRequestException('O link de convite é inválido ou já expirou.');
    }

    // Guardrail: Garante que é um token de convite
    if (payload.purpose !== 'project_invitation') {
      throw new BadRequestException('Token inválido para esta operação.');
    }

    const { projectId, invitedEmail } = payload;

    // 2. Se o convite foi gerado para um e-mail específico, valida se o usuário logado é o dono do e-mail
    if (invitedEmail && invitedEmail !== currentUser.email) {
      throw new ForbiddenException('Este convite não foi emitido para o seu usuário.');
    }

    // 3. Busca o projeto no banco de dados
    const project = await this.projectsRepository.findOne({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('O projeto deste convite não existe mais.');
    }

    // Inicializa o array se ele estiver nulo por algum motivo
    project.participants = project.participants || [];

    // 4. Verifica se o usuário já é um participante do projeto
    const alreadyParticipant = project.participants.some(p => p.id === currentUser.id);
    if (alreadyParticipant) {
      this.logger.warn(`Usuário ${currentUser.id} já faz parte do projeto.`);
      return project; // Retorna o projeto atualizado sem duplicar
    }

    // 5. Adiciona o novo participante ao array (seguindo a sua interface IParticipants)
    const newParticipant: IParticipants = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl || null, // Caso o avatar seja opcional
    };

    project.participants.push(newParticipant);

    // 6. Salva no banco e Invalida os Caches do Redis!
    try {
      const savedProject = await this.projectsRepository.save(project);
      
      // Como o projeto mudou, limpamos o cache do Redis para o GET não trazer dados velhos
      await this.redisService.del(`projects:${projectId}`);
      await this.redisService.del('projects:all');

      this.logger.log(`Usuário ${currentUser.id} adicionado com sucesso ao projeto ${projectId}.`);
      return savedProject;
    } catch (error: any) {
      this.logger.error(`Erro ao salvar participante no projeto. Erro: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erro ao aceitar o convite. Tente novamente.');
    }
  }
}
