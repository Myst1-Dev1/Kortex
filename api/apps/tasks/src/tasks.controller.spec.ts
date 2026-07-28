import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            ping: jest.fn().mockReturnValue({ ok: true, service: 'tasks', now: '2026-01-01T00:00:00.000Z' }),
            create: jest.fn().mockResolvedValue({ id: 't1', name: 'Task' }),
            findByProject: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: 't1', name: 'Task' }),
            update: jest.fn().mockResolvedValue({ id: 't1', name: 'Updated' }),
            updateStatus: jest.fn().mockResolvedValue({ id: 't1', status: 'DONE' }),
            remove: jest.fn().mockResolvedValue({ message: 'Task removida com sucesso.' }),
          },
        },
      ],
    }).compile();

    tasksController = app.get<TasksController>(TasksController);
    tasksService = app.get<TasksService>(TasksService);
  });

  describe('ping', () => {
    it('should return tasks health payload', () => {
      expect(tasksController.ping()).toEqual({
        ok: true,
        service: 'tasks',
        now: '2026-01-01T00:00:00.000Z',
      });
      expect(tasksService.ping).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a task', async () => {
      const dto = { name: 'Task', project_id: 'p1', task_author_id: 'u1' } as any;
      const result = await tasksController.create(dto);
      expect(result.id).toBe('t1');
      expect(tasksService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const result = await tasksController.findOne('t1');
      expect(result.id).toBe('t1');
      expect(tasksService.findOne).toHaveBeenCalledWith('t1');
    });
  });

  describe('findByProject', () => {
    it('should return tasks for a project', async () => {
      const result = await tasksController.findAll('p1');
      expect(result).toEqual([]);
      expect(tasksService.findByProject).toHaveBeenCalledWith('p1');
    });
  });
});
