import { Task, QuadrantConfig } from '@/types/task';
import { TaskList } from './TaskList';
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
    isDragOver: boolean;
}

export const MatrixQuadrant = ({
    config,
    tasks,
    onToggleComplete,
    onDelete,
    isDragOver
}: MatrixQuadrantProps) => {
    return (
        <section
            aria-label={config.title}
            className={cn(
                "h-full flex flex-col rounded-lg p-4 transition-all duration-300",
                QUADRANT_BACKGROUNDS[config.id],
                "border-2 border-matrix-border/50",
                isDragOver && "border-matrix-green shadow-glow",
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

            <TaskList
                containerId={config.id}
                tasks={tasks}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                emptyMessage="Drop tasks here"
                itemClassName="animate-scale-in"
                className="flex-1 overflow-y-auto"
            />
        </section>
    );
};
