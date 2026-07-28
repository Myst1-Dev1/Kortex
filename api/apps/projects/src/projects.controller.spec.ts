import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

describe('ProjectsController', () => {
  let projectsController: ProjectsController;
  let projectsService: ProjectsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            ping: jest.fn().mockReturnValue({ ok: true, service: 'projects', now: '2026-01-01T00:00:00.000Z' }),
            getAllProjects: jest.fn().mockResolvedValue([]),
            getProjectById: jest.fn().mockResolvedValue({ id: 'p1', name: 'Test' }),
            createProject: jest.fn().mockResolvedValue({ id: 'p1', name: 'Created' }),
            updateProject: jest.fn().mockResolvedValue({ id: 'p1', name: 'Updated' }),
            deleteProject: jest.fn().mockResolvedValue(undefined),
            generateInviteLink: jest.fn().mockResolvedValue('http://invite.link'),
            acceptInvite: jest.fn().mockResolvedValue({ id: 'p1', name: 'Project' }),
          },
        },
      ],
    }).compile();

    projectsController = app.get<ProjectsController>(ProjectsController);
    projectsService = app.get<ProjectsService>(ProjectsService);
  });

  describe('ping', () => {
    it('should return projects health payload', () => {
      expect(projectsController.ping()).toEqual({
        ok: true,
        service: 'projects',
        now: '2026-01-01T00:00:00.000Z',
      });
      expect(projectsService.ping).toHaveBeenCalled();
    });
  });

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const result = await projectsController.getAllProjects();
      expect(result).toEqual([]);
      expect(projectsService.getAllProjects).toHaveBeenCalled();
    });
  });

  describe('getProjectById', () => {
    it('should return a project by id', async () => {
      const result = await projectsController.getProjectById({ id: 'p1' });
      expect(result.id).toBe('p1');
      expect(projectsService.getProjectById).toHaveBeenCalledWith('p1');
    });
  });

  describe('createProject', () => {
    it('should create a project', async () => {
      const dto = { name: 'Created', author_id: 'u1' } as any;
      const result = await projectsController.createProject(dto);
      expect(result.id).toBe('p1');
      expect(projectsService.createProject).toHaveBeenCalledWith(dto);
    });
  });
});
