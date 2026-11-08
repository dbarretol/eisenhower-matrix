import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps extends React.HTMLAttributes<HTMLDivElement> {
    task: Task;
    onToggleComplete?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
    isDragging?: boolean;
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
                "group flex items-center gap-3 p-3 rounded-lg touch-none",
                "bg-matrix-surface border border-matrix-border",
                "hover:bg-secondary/50 hover:border-matrix-green/30",
                "transition-colors duration-200 hover:shadow-glow",
                "cursor-grab select-none outline-none",
                "focus-visible:ring-2 focus-visible:ring-matrix-green",
                isDragging && "opacity-40",
                isOverlay && "cursor-grabbing shadow-glow border-matrix-green/60 rotate-2",
                task.completed && !isDragging && "opacity-60",
                className
            )}
            {...props}
        >
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

            <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete?.(task.id)}
                onKeyDown={stopKeyboardDrag}
                aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                className="border-matrix-green data-[state=checked]:bg-matrix-green data-[state=checked]:border-matrix-green"
            />

            <span
                className={cn(
                    "flex-1 text-sm font-medium break-words min-w-0",
                    task.completed && "line-through text-muted-foreground"
                )}
            >
                {task.text}
            </span>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(task.id)}
                onKeyDown={stopKeyboardDrag}
                aria-label="Delete task"
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};
