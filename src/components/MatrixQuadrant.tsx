import { Task, QuadrantConfig } from '@/types/task';
import { TaskItem } from './TaskItem';
import { cn } from '@/lib/utils';

// Full class names so Tailwind can detect them at build time.
const QUADRANT_BACKGROUNDS: Record<QuadrantConfig['id'], string> = {
    urgent_important: 'bg-gradient-urgent-important',
    important: 'bg-gradient-important',
    urgent: 'bg-gradient-urgent',
    neither: 'bg-gradient-neither',
};

interface MatrixQuadrantProps {
    config: QuadrantConfig;
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onDragStart: (e: React.DragEvent, task: Task) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    draggedTaskId: string | null;
    isDragOver: boolean;
}

export const MatrixQuadrant = ({
    config,
    tasks,
    onToggleComplete,
    onDelete,
    onDragStart,
    onDragOver,
    onDrop,
    draggedTaskId,
    isDragOver
}: MatrixQuadrantProps) => {
    return (
        <div
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={cn(
                "h-full rounded-lg p-4 transition-all duration-300",
                QUADRANT_BACKGROUNDS[config.id],
                "border-2 border-matrix-border/50",
                isDragOver && "border-matrix-green shadow-glow scale-[1.02]",
                "backdrop-blur-sm"
            )}
        >
            <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground mb-1">
                    {config.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {config.description}
                </p>
            </div>

            <div className="space-y-2 max-h-[calc(100%-5rem)] overflow-y-auto">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onDelete={onDelete}
                            onDragStart={onDragStart}
                            isDragging={draggedTaskId === task.id}
                            className="animate-scale-in"
                        />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground/60 py-8 text-sm">
                        Drop tasks here
                    </div>
                )}
            </div>
        </div>
    );
};