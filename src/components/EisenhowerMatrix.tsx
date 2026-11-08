import type { ContainerId, Quadrant, Task } from '@/types/task';
import { QUADRANT_CONFIGS } from '@/lib/quadrants';
import { MatrixQuadrant } from './MatrixQuadrant';
import { cn } from '@/lib/utils';

interface EisenhowerMatrixProps {
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    dragOverContainer: ContainerId | null;
}

// Grid placement and the two crossing axes (drawn as borders between zones).
const ZONE_LAYOUT: Record<Quadrant, string> = {
    urgent_important: 'lg:col-start-2 lg:row-start-2 lg:border-r-2 lg:border-b-2 lg:border-axis',
    important: 'lg:col-start-3 lg:row-start-2 lg:border-b-2 lg:border-axis',
    urgent: 'lg:col-start-2 lg:row-start-3 lg:border-r-2 lg:border-axis',
    neither: 'lg:col-start-3 lg:row-start-3',
};

const axisLabel = "hidden items-center justify-center font-display text-[15px] font-semibold text-ink lg:flex";

export const EisenhowerMatrix = ({
    tasks,
    onToggleComplete,
    onDelete,
    dragOverContainer
}: EisenhowerMatrixProps) => {
    return (
        <div
            role="region"
            aria-label="Eisenhower matrix"
            className={cn(
                "grid min-h-0 flex-1 gap-3 md:grid-cols-2 lg:gap-0",
                "lg:grid-cols-[34px_1fr_1fr] lg:grid-rows-[30px_1fr_1fr]"
            )}
        >
            <div aria-hidden="true" className={cn(axisLabel, "lg:col-start-2 lg:row-start-1")}>Urgent</div>
            <div aria-hidden="true" className={cn(axisLabel, "lg:col-start-3 lg:row-start-1")}>Not urgent</div>
            <div aria-hidden="true" className={cn(axisLabel, "lg:col-start-1 lg:row-start-2 [writing-mode:vertical-rl] rotate-180")}>Important</div>
            <div aria-hidden="true" className={cn(axisLabel, "lg:col-start-1 lg:row-start-3 [writing-mode:vertical-rl] rotate-180")}>Not important</div>

            {QUADRANT_CONFIGS.map((config) => (
                <MatrixQuadrant
                    key={config.id}
                    config={config}
                    tasks={tasks.filter(task => task.quadrant === config.id)}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                    isDragOver={dragOverContainer === config.id}
                    className={cn("rounded-card lg:rounded-none", ZONE_LAYOUT[config.id])}
                />
            ))}

            {/* Point where the axes cross */}
            <span
                aria-hidden="true"
                className="pointer-events-none z-20 hidden size-3 place-self-center rounded-full bg-axis shadow-[0_0_0_4px_var(--plane)] lg:col-start-2 lg:col-end-4 lg:row-start-2 lg:row-end-4 lg:block"
            />
        </div>
    );
};
