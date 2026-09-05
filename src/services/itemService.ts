import { NotFoundError, ValidationError } from "../domain/errors.js";
import type { CreateItemInput, Item, UpdateItemInput } from "../domain/types.js";
import type { Clock } from "../lib/clock.js";
import { newId } from "../lib/id.js";
import type { ItemRepository } from "../repositories/itemRepository.js";

const NAME_MIN = 1;
const NAME_MAX = 120;
const DESCRIPTION_MAX = 2000;

export interface ItemService {
  list(): Item[];
  get(id: string): Item;
  create(input: CreateItemInput): Item;
  update(id: string, input: UpdateItemInput): Item;
  remove(id: string): void;
}

function assertName(name: unknown): string {
  if (typeof name !== "string" || name.trim().length < NAME_MIN) {
    throw new ValidationError("name is required");
  }
  const trimmed = name.trim();
  if (trimmed.length > NAME_MAX) {
    throw new ValidationError(`name must be at most ${NAME_MAX} characters`);
  }
  return trimmed;
}

function assertDescription(description: unknown): string {
  if (description === undefined || description === null) {
    return "";
  }
  if (typeof description !== "string") {
    throw new ValidationError("description must be a string");
  }
  if (description.length > DESCRIPTION_MAX) {
    throw new ValidationError(
      `description must be at most ${DESCRIPTION_MAX} characters`,
    );
  }
  return description;
}

export function createItemService(
  repo: ItemRepository,
  clock: Clock,
): ItemService {
  return {
    list(): Item[] {
      return repo.list();
    },
    get(id: string): Item {
      const item = repo.getById(id);
      if (!item) {
        throw new NotFoundError("item", id);
      }
      return item;
    },
    create(input: CreateItemInput): Item {
      const now = clock.now();
      const item: Item = {
        id: newId("itm"),
        name: assertName(input.name),
        description: assertDescription(input.description),
        createdAt: now,
        updatedAt: now,
      };
      repo.save(item);
      return item;
    },
    update(id: string, input: UpdateItemInput): Item {
      const current = this.get(id);
      const next: Item = {
        ...current,
        name: input.name === undefined ? current.name : assertName(input.name),
        description:
          input.description === undefined
            ? current.description
            : assertDescription(input.description),
        updatedAt: clock.now(),
      };
      repo.save(next);
      return next;
    },
    remove(id: string): void {
      const existed = repo.delete(id);
      if (!existed) {
        throw new NotFoundError("item", id);
      }
    },
  };
}
