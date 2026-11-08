import { useState, useEffect } from 'react';
import { Task } from '@/types/task';

const STORAGE_KEY = 'eisenhower-matrix-tasks';
const BACKUP_KEY = `${STORAGE_KEY}-corrupted-backup`;

const QUADRANTS: ReadonlySet<Task['quadrant']> = new Set([
    'unassigned',
    'urgent_important',
    'important',
    'urgent',
    'neither',
]);

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
            quadrant: QUADRANTS.has(quadrant as Task['quadrant'])
                ? (quadrant as Task['quadrant'])
                : 'unassigned',
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

    const moveTask = (taskId: string, newQuadrant: Task['quadrant']) => {
        updateTask(taskId, { quadrant: newQuadrant });
    };

    return {
        tasks,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
    };
};
