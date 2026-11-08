import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ContainerId, Task } from '@/types/task';
import { SortableTaskItem } from './SortableTaskItem';
import { cn } from '@/lib/utils';

interface TaskListProps {
    containerId: ContainerId;
    /** Accessible name for the list, also used when focus moves to it after a delete. */
    label: string;
    tasks: Task[];
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    emptyMessage: string;
    className?: string;
}

// A drop target that holds a sortable list of tasks.
export const TaskList = ({
    containerId,
    label,
    tasks,
    onToggleComplete,
    onDelete,
    emptyMessage,
    className,
}: TaskListProps) => {
    const { setNodeRef } = useDroppable({ id: containerId });

    return (
        <SortableContext id={containerId} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div
                ref={setNodeRef}
                role="group"
                aria-label={label}
                tabIndex={-1}
                data-task-list
                className={cn("flex flex-col gap-2 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ink", className)}
            >
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <SortableTaskItem
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onDelete={onDelete}
                            className="animate-enter"
                        />
                    ))
                ) : (
                    <p className="max-w-[34ch] text-[13.5px] text-muted">{emptyMessage}</p>
                )}
            </div>
        </SortableContext>
    );
};
