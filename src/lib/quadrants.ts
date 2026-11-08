import { QuadrantConfig, Task } from '@/types/task';

export const QUADRANT_CONFIGS: QuadrantConfig[] = [
    {
        id: 'urgent_important',
        title: 'Urgent & Important',
        description: 'Do first - Crisis management',
        gradient: 'urgent-important',
        icon: '🔥'
    },
    {
        id: 'important',
        title: 'Important, Not Urgent',
        description: 'Schedule - Prevention & planning',
        gradient: 'important',
        icon: '📅'
    },
    {
        id: 'urgent',
        title: 'Urgent, Not Important',
        description: 'Delegate - Interruptions',
        gradient: 'urgent',
        icon: '⏰'
    },
    {
        id: 'neither',
        title: 'Not Urgent, Not Important',
        description: 'Eliminate - Time wasters',
        gradient: 'neither',
        icon: '🗑️'
    }
];

export const CONTAINER_IDS: Task['quadrant'][] = ['unassigned', ...QUADRANT_CONFIGS.map(q => q.id)];

export const CONTAINER_NAMES: Record<Task['quadrant'], string> = {
    unassigned: 'Task Backlog',
    ...Object.fromEntries(QUADRANT_CONFIGS.map(q => [q.id, q.title])),
} as Record<Task['quadrant'], string>;
