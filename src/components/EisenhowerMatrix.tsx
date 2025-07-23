import { Task, QuadrantConfig } from '@/types/task';
import { MatrixQuadrant } from './MatrixQuadrant';
import { useState } from 'react';

interface EisenhowerMatrixProps {
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onDragStart: (e: React.DragEvent, task: Task) => void;
    onMoveTask: (taskId: string, quadrant: Task['quadrant']) => void;
    draggedTaskId: string | null;
}

const QUADRANT_CONFIGS: QuadrantConfig[] = [
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

export const EisenhowerMatrix = ({
    tasks,
    onToggleComplete,
    onDelete,
    onDragStart,
    onMoveTask,
    draggedTaskId
}: EisenhowerMatrixProps) => {
    const [dragOverQuadrant, setDragOverQuadrant] = useState<string | null>(null);

    const handleDragOver = (e: React.DragEvent, quadrantId: string) => {
        e.preventDefault();
        setDragOverQuadrant(quadrantId);
    };

    const handleDragLeave = () => {
        setDragOverQuadrant(null);
    };

    const handleDrop = (e: React.DragEvent, quadrantId: string) => {
        e.preventDefault();
        setDragOverQuadrant(null);

        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            onMoveTask(taskId, quadrantId as Task['quadrant']);
        }
    };

    const getTasksForQuadrant = (quadrantId: string) => {
        return tasks.filter(task => task.quadrant === quadrantId);
    };

    return (
        <div className="flex-1 p-6 bg-gradient-matrix">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-matrix-green mb-2 animate-matrix-glow">
                    Eisenhower Matrix
                </h1>
                <p className="text-muted-foreground">
                    Organize your tasks by urgency and importance
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6 h-[calc(100vh-200px)]">
                {QUADRANT_CONFIGS.map((config) => (
                    <div
                        key={config.id}
                        onDragLeave={handleDragLeave}
                        className="animate-fade-in"
                    >
                        <MatrixQuadrant
                            config={config}
                            tasks={getTasksForQuadrant(config.id)}
                            onToggleComplete={onToggleComplete}
                            onDelete={onDelete}
                            onDragStart={onDragStart}
                            onDragOver={(e) => handleDragOver(e, config.id)}
                            onDrop={(e) => handleDrop(e, config.id)}
                            draggedTaskId={draggedTaskId}
                            isDragOver={dragOverQuadrant === config.id}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};