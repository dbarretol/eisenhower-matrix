import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';

interface SortableTaskItemProps {
    task: Task;
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    className?: string;
}

export const SortableTaskItem = ({ task, onToggleComplete, onDelete, className }: SortableTaskItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
    });

    return (
        <TaskItem
            ref={setNodeRef}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            isDragging={isDragging}
            className={className}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            {...attributes}
            {...listeners}
        />
    );
};
