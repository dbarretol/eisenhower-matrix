import { useState, useEffect } from 'react';
import { Task } from '@/types/task';

const STORAGE_KEY = 'eisenhower-matrix-tasks';

export const useTaskStorage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    // Load tasks from localStorage on mount
    useEffect(() => {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (savedTasks) {
            try {
                const parsedTasks = JSON.parse(savedTasks);
                setTasks(parsedTasks);
            } catch (error) {
                console.error('Error loading tasks:', error);
            }
        }
    }, []);

    // Save tasks to localStorage whenever tasks change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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