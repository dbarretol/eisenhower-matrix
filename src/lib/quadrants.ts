import { QuadrantConfig, Task } from '@/types/task';

// Order matches the classic matrix: top-left, top-right, bottom-left, bottom-right.
export const QUADRANT_CONFIGS: QuadrantConfig[] = [
    {
        id: 'urgent_important',
        verb: 'Do',
        title: 'Urgent and important',
        description: 'Handle these today',
        emptyMessage: 'Drag tasks here that need to happen today.',
        colorVar: '--q-do',
    },
    {
        id: 'important',
        verb: 'Schedule',
        title: 'Important, not urgent',
        description: 'Pick a day for these',
        emptyMessage: 'Drag tasks here that matter but can wait for a set day.',
        colorVar: '--q-schedule',
    },
    {
        id: 'urgent',
        verb: 'Delegate',
        title: 'Urgent, not important',
        description: 'Hand these to someone else',
        emptyMessage: 'Drag tasks here that someone else can handle.',
        colorVar: '--q-delegate',
    },
    {
        id: 'neither',
        verb: 'Drop',
        title: 'Not urgent, not important',
        description: 'Let these go',
        emptyMessage: 'Drag tasks here that you can skip without consequences.',
        colorVar: '--q-drop',
    },
];

export const CONTAINER_IDS: Task['quadrant'][] = ['unassigned', ...QUADRANT_CONFIGS.map(q => q.id)];

export const CONTAINER_NAMES: Record<Task['quadrant'], string> = {
    unassigned: 'Backlog',
    ...Object.fromEntries(QUADRANT_CONFIGS.map(q => [q.id, q.verb])),
} as Record<Task['quadrant'], string>;
