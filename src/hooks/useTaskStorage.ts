import { useState, useEffect } from 'react';
import type { ContainerId, Task } from '@/types/task';
import * as taskList from '@/lib/tasks';

export const STORAGE_KEY = 'eisenhower-matrix-tasks';
export const BACKUP_KEY = `${STORAGE_KEY}-corrupted-backup`;

// Reads saved tasks synchronously so the first render already has them and the
// save effect never overwrites stored data with an empty list.
export const loadTasks = (): Task[] => {
    let saved: string | null = null;
    try {
        saved = localStorage.getItem(STORAGE_KEY);
        return saved ? taskList.sanitizeTasks(JSON.parse(saved)) : [];
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
        if (text.trim() === '') return;
        setTasks(prev => [...prev, taskList.createTask(text)]);
    };

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
        ));
    };

    const deleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    const moveTask = (taskId: string, to: ContainerId, beforeTaskId?: string) => {
        setTasks(prev => taskList.moveTask(prev, taskId, to, beforeTaskId));
    };

    const reorderTask = (taskId: string, overTaskId: string) => {
        setTasks(prev => taskList.reorderTask(prev, taskId, overTaskId));
    };

    const restoreTask = (task: Task, index: number) => {
        setTasks(prev => taskList.restoreTask(prev, task, index));
    };

    return {
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        reorderTask,
        restoreTask,
    };
};
