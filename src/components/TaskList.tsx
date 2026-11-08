import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/types/task';
import { SortableTaskItem } from './SortableTaskItem';
import { cn } from '@/lib/utils';

interface TaskListProps {
    containerId: Task['quadrant'];
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    emptyMessage: string;
    itemClassName?: string;
    className?: string;
}

// A drop target that holds a sortable list of tasks.
export const TaskList = ({
    containerId,
    tasks,
    onToggleComplete,
    onDelete,
    emptyMessage,
    itemClassName,
    className,
}: TaskListProps) => {
    const { setNodeRef } = useDroppable({ id: containerId });

    return (
        <SortableContext id={containerId} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef} className={cn("flex flex-col gap-2 min-h-16", className)}>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <SortableTaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onDelete={onDelete}
                            className={itemClassName}
                        />
                    ))
                ) : (
                    <div className="flex flex-1 items-center justify-center text-center text-muted-foreground/60 py-8 text-sm">
                        {emptyMessage}
                    </div>
                )}
            </div>
        </SortableContext>
    );
};
