import { Task } from '@/types/task';
import { QUADRANT_CONFIGS } from '@/lib/quadrants';
import { MatrixQuadrant } from './MatrixQuadrant';

interface EisenhowerMatrixProps {
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    dragOverContainer: Task['quadrant'] | null;
}

export const EisenhowerMatrix = ({
    tasks,
    onToggleComplete,
    onDelete,
    dragOverContainer
}: EisenhowerMatrixProps) => {
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
                    <div key={config.id} className="animate-fade-in min-h-0">
                        <MatrixQuadrant
                            config={config}
                            tasks={tasks.filter(task => task.quadrant === config.id)}
                            onToggleComplete={onToggleComplete}
                            onDelete={onDelete}
                            isDragOver={dragOverContainer === config.id}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
