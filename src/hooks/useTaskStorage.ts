import { useState, useEffect } from 'react';
import type { ContainerId, Task } from '@/types/task';
import { isContainerId } from '@/lib/quadrants';

const STORAGE_KEY = 'eisenhower-matrix-tasks';
const BACKUP_KEY = `${STORAGE_KEY}-corrupted-backup`;

// Keeps only well-formed tasks so corrupted or outdated data can't break the app.
const sanitizeTasks = (value: unknown): Task[] => {
    if (!Array.isArray(value)) return [];

    return value.flatMap((item): Task[] => {
        if (typeof item !== 'object' || item === null) return [];
        const { id, text, quadrant, completed, createdAt } = item as Record<string, unknown>;
        if (typeof id !== 'string' || typeof text !== 'string') return [];

        return [{
            id,
            text,
            quadrant: isContainerId(quadrant) ? quadrant : 'unassigned',
            completed: completed === true,
            createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
        }];
    });
};

// Reads saved tasks synchronously so the first render already has them and the
// save effect never overwrites stored data with an empty list.
const loadTasks = (): Task[] => {
    let saved: string | null = null;
    try {
        saved = localStorage.getItem(STORAGE_KEY);
        return saved ? sanitizeTasks(JSON.parse(saved)) : [];
    } catch (error) {
        console.error('Error loading tasks:', error);
        // Keep unreadable data instead of letting the next save overwrite it.
        if (saved) {
            try {
                localStorage.setItem(BACKUP_KEY, saved);
            } catch {
                // Storage unavailable; nothing else to do.
            }
        }
        return [];
    }
};

export const useTaskStorage = () => {
    const [tasks, setTasks] = useState<Task[]>(loadTasks);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }, [tasks]);

    const addTask = (text: string) => {
        const newTask: Task = {
            id: crypto.randomUUID(),
            text: text.trim(),
            quadrant: 'unassigned',
            completed: false,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => [...prev, newTask]);
    };

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
        ));
    };

    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    // Moves a task to a quadrant. If `beforeTaskId` is given, the task is placed right
    // before it; otherwise it goes to the end. Order within a quadrant follows array order.
    const moveTask = (taskId: string, newQuadrant: ContainerId, beforeTaskId?: string) => {
        setTasks(prev => {
            const task = prev.find(t => t.id === taskId);
            if (!task) return prev;

            const rest = prev.filter(t => t.id !== taskId);
            const moved = { ...task, quadrant: newQuadrant };
            const index = beforeTaskId ? rest.findIndex(t => t.id === beforeTaskId) : -1;

            if (index === -1) return [...rest, moved];
            return [...rest.slice(0, index), moved, ...rest.slice(index)];
        });
    };

    // Moves `taskId` to the position of `overTaskId`, shifting the tasks in between.
    const reorderTask = (taskId: string, overTaskId: string) => {
        setTasks(prev => {
            const from = prev.findIndex(t => t.id === taskId);
            const to = prev.findIndex(t => t.id === overTaskId);
            if (from === -1 || to === -1 || from === to) return prev;

            const next = [...prev];
            const [task] = next.splice(from, 1);
            next.splice(to, 0, task);
            return next;
        });
    };

    return {
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        reorderTask,
    };
};
