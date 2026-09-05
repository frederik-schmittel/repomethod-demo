import { systemClock, type Clock } from "./lib/clock.js";
import {
  createInMemoryProjectRepository,
  type ProjectRepository,
} from "./repositories/projectRepository.js";
import {
  createInMemoryTaskRepository,
  type TaskRepository,
} from "./repositories/taskRepository.js";
import {
  createProjectService,
  type ProjectService,
} from "./services/projectService.js";
import { createTaskService, type TaskService } from "./services/taskService.js";

export interface Container {
  clock: Clock;
  projectRepository: ProjectRepository;
  taskRepository: TaskRepository;
  projectService: ProjectService;
  taskService: TaskService;
}

export interface ContainerOverrides {
  clock?: Clock;
}

export function createContainer(overrides: ContainerOverrides = {}): Container {
  const clock = overrides.clock ?? systemClock;
  const projectRepository = createInMemoryProjectRepository();
  const taskRepository = createInMemoryTaskRepository();
  const projectService = createProjectService(projectRepository, clock);
  const taskService = createTaskService(
    taskRepository,
    projectRepository,
    clock,
  );

  return {
    clock,
    projectRepository,
    taskRepository,
    projectService,
    taskService,
  };
}
