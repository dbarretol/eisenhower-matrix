import type { ContainerId, Task } from '@/types/task';
import { isContainerId } from '@/lib/quadrants';

/** Longest task text the app accepts. */
export const MAX_TASK_LENGTH = 200;

// `crypto.randomUUID` only exists on secure origins (https or localhost). When the app is
// opened another way, build a random version 4 UUID from `getRandomValues`, which always exists.
const createId = (): string => {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/** A new, unsorted task. */
export const createTask = (text: string): Task => ({
    id: createId(),
    text: text.trim().slice(0, MAX_TASK_LENGTH),
    quadrant: 'unassigned',
    completed: false,
    createdAt: new Date().toISOString(),
});

/**
 * Keeps only well-formed tasks so corrupted or outdated data can't break the app.
 * Drops items without an id or text and repeated ids (they would break drag and drop),
 * trims and shortens text, and fills in missing fields.
 */
export const sanitizeTasks = (value: unknown): Task[] => {
    if (!Array.isArray(value)) return [];

    const seen = new Set<string>();
    return value.flatMap((item): Task[] => {
        if (typeof item !== 'object' || item === null) return [];
        const { id, text, quadrant, completed, createdAt } = item as Record<string, unknown>;
        if (typeof id !== 'string' || id === '' || seen.has(id) || typeof text !== 'string') return [];

        const cleanText = text.trim().slice(0, MAX_TASK_LENGTH);
        if (cleanText === '') return [];
        seen.add(id);

        return [{
            id,
            text: cleanText,
            quadrant: isContainerId(quadrant) ? quadrant : 'unassigned',
            completed: completed === true,
            createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
        }];
    });
};

/**
 * Moves a task to a list. If `beforeTaskId` is given, the task is placed right before it;
 * otherwise it goes to the end. Order within a list follows array order.
 */
export const moveTask = (tasks: Task[], taskId: string, to: ContainerId, beforeTaskId?: string): Task[] => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return tasks;

    const rest = tasks.filter(t => t.id !== taskId);
    const moved = { ...task, quadrant: to };
    const index = beforeTaskId ? rest.findIndex(t => t.id === beforeTaskId) : -1;

    if (index === -1) return [...rest, moved];
    return [...rest.slice(0, index), moved, ...rest.slice(index)];
};

/** Moves `taskId` to the position of `overTaskId`, shifting the tasks in between. */
export const reorderTask = (tasks: Task[], taskId: string, overTaskId: string): Task[] => {
    const from = tasks.findIndex(t => t.id === taskId);
    const to = tasks.findIndex(t => t.id === overTaskId);
    if (from === -1 || to === -1 || from === to) return tasks;

    const next = [...tasks];
    const [task] = next.splice(from, 1);
    next.splice(to, 0, task);
    return next;
};

/** Puts a deleted task back at its old position (or at the end if the list got shorter). */
export const restoreTask = (tasks: Task[], task: Task, index: number): Task[] => {
    if (tasks.some(t => t.id === task.id)) return tasks;
    const at = Math.min(Math.max(index, 0), tasks.length);
    return [...tasks.slice(0, at), task, ...tasks.slice(at)];
};
