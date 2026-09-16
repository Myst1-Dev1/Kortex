import { Controller, Inject, Get, UseGuards, Post, Body, Param, Patch, Delete, HttpStatus, HttpCode } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices/client/client-proxy";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateProjectDto } from "./dto/createProjectDto";
import { UpdateProjectDto } from "./dto/updateProjectDto";
import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiBearerAuth, 
    ApiParam, 
    ApiBody, 
    ApiQuery 
} from "@nestjs/swagger";

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects') 
export class ProjectsController {
    constructor(
        @Inject('PROJECTS_CLIENT') private readonly projectsClient: ClientProxy
    ) {}

    @Get()
    @ApiOperation({ summary: 'Listar todos os projetos do usuário' })
    @ApiResponse({ status: 200, description: 'Lista de projetos retornada com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async getAllProjects() {
        return this.projectsClient.send('projects.getAll', {});
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar um projeto específico pelo ID' })
    @ApiParam({ name: 'id', description: 'UUID do projeto', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ status: 200, description: 'Projeto encontrado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
    async getProjectById(@Param('id') id: string) {
        return this.projectsClient.send('projects.getById', { id });
    }

    @Post('create-new-project')
    @ApiOperation({ summary: 'Criar um novo projeto' })
    @ApiBody({ type: CreateProjectDto })
    @ApiResponse({ status: 201, description: 'Projeto criado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async createNewProject(@Body() projectData: CreateProjectDto) {
        return this.projectsClient.send('projects.create', projectData);
    }

    @Patch(':id/update')
    @ApiOperation({ summary: 'Atualizar dados de um projeto existente' })
    @ApiParam({ name: 'id', description: 'UUID do projeto a ser atualizado', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiBody({ type: UpdateProjectDto })
    @ApiResponse({ status: 200, description: 'Projeto atualizado com sucesso.' })
    @ApiResponse({ status: 400, description: 'Dados inválidos.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
    async updateProject(@Param('id') id: string, @Body() projectData: UpdateProjectDto) {
        return this.projectsClient.send('projects.update', { id, dto: projectData });
    }

    @Delete(':id/delete')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Deletar um projeto pelo ID' })
    @ApiParam({ name: 'id', description: 'UUID do projeto a ser deletado', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiResponse({ status: 200, description: 'Projeto deletado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
    async deleteProject(@Param('id') id: string) {
        return this.projectsClient.send('projects.delete', { id });
    }

    @Post(':id/invite')
    @ApiOperation({ summary: 'Gerar link de convite para o projeto' })
    @ApiParam({ name: 'id', description: 'UUID do projeto', example: '123e4567-e89b-12d3-a456-426614174000' })
    @ApiBody({ 
        schema: { 
            type: 'object', 
            properties: { email: { type: 'string', example: 'convidado@email.com', description: 'E-mail opcional do convidado' } } 
        } 
    })
    @ApiResponse({ status: 201, description: 'Link ou convite gerado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async invite(@Param('id') id: string, @Body('email') email?: string) {
        return this.projectsClient.send('projects.generateInviteLink', { projectId: id, invitedEmail: email });
    }

    @Post('accept-invite')
    @ApiOperation({ summary: 'Aceitar um convite para entrar em um projeto' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['token', 'currentUser'],
            properties: {
                token: { type: 'string', example: 'jwt_token_do_convite_aqui', description: 'Token do convite recebido' },
                currentUser: {
                    type: 'object',
                    required: ['id', 'name', 'email'],
                    properties: {
                        id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                        name: { type: 'string', example: 'João da Silva' },
                        email: { type: 'string', example: 'joao@email.com' },
                        avatarUrl: { type: 'string', nullable: true, example: 'https://exemplo.com/avatar.jpg' },
                    },
                },
            },
        },
    })
    @ApiResponse({ status: 201, description: 'Convite aceito com sucesso, usuário vinculado ao projeto.' })
    @ApiResponse({ status: 400, description: 'Token inválido ou expirado.' })
    @ApiResponse({ status: 401, description: 'Não autorizado.' })
    async acceptInvite(
        @Body('token') token: string, 
        @Body('currentUser') currentUser: { id: string, name: string, email: string, avatarUrl: string | null }
    ) {
        return this.projectsClient.send('projects.acceptInvite', { token, currentUser });
    }
}