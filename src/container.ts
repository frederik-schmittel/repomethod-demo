import { systemClock, type Clock } from "./lib/clock.js";
import {
  createInMemoryItemRepository,
  type ItemRepository,
} from "./repositories/itemRepository.js";
import {
  createInMemoryTaskRepository,
  type TaskRepository,
} from "./repositories/taskRepository.js";
import { createItemService, type ItemService } from "./services/itemService.js";
import { createTaskService, type TaskService } from "./services/taskService.js";

export interface Container {
  clock: Clock;
  itemRepository: ItemRepository;
  taskRepository: TaskRepository;
  itemService: ItemService;
  taskService: TaskService;
}

export interface ContainerOverrides {
  clock?: Clock;
}

export function createContainer(overrides: ContainerOverrides = {}): Container {
  const clock = overrides.clock ?? systemClock;
  const itemRepository = createInMemoryItemRepository();
  const taskRepository = createInMemoryTaskRepository();
  const itemService = createItemService(itemRepository, clock);
  const taskService = createTaskService(taskRepository, clock);

  return {
    clock,
    itemRepository,
    taskRepository,
    itemService,
    taskService,
  };
}
