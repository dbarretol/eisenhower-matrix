import type { CSSProperties } from 'react';
import type { QuadrantConfig, Task } from '@/types/task';
import { TaskList } from './TaskList';
import { cn } from '@/lib/utils';

interface MatrixQuadrantProps {
    config: QuadrantConfig;
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    isDragOver: boolean;
    className?: string;
}

export const MatrixQuadrant = ({
    config,
    tasks,
    onToggleComplete,
    onDelete,
    isDragOver,
    className,
}: MatrixQuadrantProps) => {
    const headingId = `zone-${config.id}`;

    return (
        <section
            aria-labelledby={headingId}
            style={{ '--zone': `var(${config.colorVar})` } as CSSProperties}
            className={cn(
                "zone relative flex min-h-56 flex-col gap-3 overflow-hidden px-5 pt-4 pb-5",
                "transition-shadow duration-150",
                isDragOver && "shadow-[inset_0_0_0_2px_var(--zone)]",
                className
            )}
        >
            <header className="relative z-10 flex flex-wrap items-baseline gap-x-2.5">
                <h2 id={headingId} className="font-display text-xl font-bold text-(--zone)">
                    {config.verb}
                    <span className="sr-only">: {config.title}</span>
                </h2>
                <p className="text-[13px] text-muted">{config.description}</p>
            </header>

            <TaskList
                containerId={config.id}
                tasks={tasks}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                emptyMessage={config.emptyMessage}
                className="relative z-10 min-h-12 max-w-[520px] flex-1 overflow-y-auto p-1 -m-1"
            />

            <span
                aria-hidden="true"
                className="zone-verb pointer-events-none absolute right-3.5 -bottom-[0.16em] text-[clamp(64px,10vw,150px)] select-none"
            >
                {config.verb}
            </span>
        </section>
    );
};
