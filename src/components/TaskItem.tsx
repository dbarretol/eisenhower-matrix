import { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps extends React.HTMLAttributes<HTMLDivElement> {
    task: Task;
    onToggleComplete?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
    /** The card is being dragged; render the slot it leaves behind. */
    isDragging?: boolean;
    /** The floating copy that follows the pointer while dragging. */
    isOverlay?: boolean;
    ref?: React.Ref<HTMLDivElement>;
}

// Keeps Space/Enter on inner controls from starting a keyboard drag of the card.
const stopKeyboardDrag = (e: React.KeyboardEvent) => e.stopPropagation();

export const TaskItem = ({
    task,
    onToggleComplete,
    onDelete,
    isDragging = false,
    isOverlay = false,
    className,
    ref,
    ...props
}: TaskItemProps) => {
    return (
        <div
            ref={ref}
            className={cn(
                "group relative flex items-start gap-2.5 rounded-card border border-line bg-card py-2.5 pr-2 pl-3",
                "shadow-card cursor-grab touch-none select-none",
                "transition-[border-color,box-shadow] duration-150",
                "hover:border-muted/60",
                isDragging && "task-slot",
                isOverlay && "cursor-grabbing border-ink shadow-lift",
                className
            )}
            {...props}
        >
            <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete?.(task.id)}
                onKeyDown={stopKeyboardDrag}
                aria-label={task.completed ? `Mark “${task.text}” as not done` : `Mark “${task.text}” as done`}
                className="mt-px"
            />

            <span
                className={cn(
                    "min-w-0 flex-1 break-words",
                    task.completed && "text-muted line-through decoration-muted/70"
                )}
            >
                {task.text}
            </span>

            <button
                type="button"
                onClick={() => onDelete?.(task.id)}
                onKeyDown={stopKeyboardDrag}
                aria-label={`Delete “${task.text}”`}
                className={cn(
                    "-my-1 grid size-7 shrink-0 place-items-center rounded-md text-muted",
                    "opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100",
                    "[@media(hover:none)]:opacity-100",
                    "hover:bg-danger/10 hover:text-danger",
                    isOverlay && "opacity-0 group-hover:opacity-0"
                )}
            >
                <X className="size-4" />
            </button>
        </div>
    );
};
