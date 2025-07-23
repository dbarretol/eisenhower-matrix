import { useState } from 'react';
import { Task } from '@/types/task';
import { TaskPanel } from '@/components/TaskPanel';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
import { useTaskStorage } from '@/hooks/useTaskStorage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
    const { tasks, addTask, updateTask, deleteTask, moveTask } = useTaskStorage();
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleDragStart = (e: React.DragEvent, task: Task) => {
        e.dataTransfer.setData('text/plain', task.id);
        setDraggedTaskId(task.id);
    };

    const handleDragEnd = () => {
        setDraggedTaskId(null);
    };

    const handleToggleComplete = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            updateTask(taskId, { completed: !task.completed });
            toast({
                title: task.completed ? "Task marked incomplete" : "Task completed!",
                description: `"${task.text}" has been ${task.completed ? 'marked as incomplete' : 'completed'}`,
            });
        }
    };

    const handleDeleteTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        deleteTask(taskId);
        toast({
            title: "Task deleted",
            description: `"${task?.text}" has been removed`,
            variant: "destructive",
        });
    };

    const handleMoveTask = (taskId: string, newQuadrant: Task['quadrant']) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.quadrant !== newQuadrant) {
            moveTask(taskId, newQuadrant);
            const quadrantNames = {
                unassigned: 'Task Backlog',
                urgent_important: 'Urgent & Important',
                important: 'Important, Not Urgent',
                urgent: 'Urgent, Not Important',
                neither: 'Not Urgent, Not Important'
            };
            toast({
                title: "Task moved",
                description: `"${task.text}" moved to ${quadrantNames[newQuadrant]}`,
            });
        }
    };

    const handleAddTask = (text: string) => {
        addTask(text);
        toast({
            title: "Task added",
            description: `"${text}" added to your backlog`,
        });
    };

    return (
        <div
            className="min-h-screen bg-matrix-bg text-foreground flex"
            onDragEnd={handleDragEnd}
        >
            <TaskPanel
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onDragStart={handleDragStart}
                draggedTaskId={draggedTaskId}
            />

            <EisenhowerMatrix
                tasks={tasks}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
                onDragStart={handleDragStart}
                onMoveTask={handleMoveTask}
                draggedTaskId={draggedTaskId}
            />
        </div>
    );
};

export default Index;