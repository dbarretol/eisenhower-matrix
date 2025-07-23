import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
    task: Task;
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onDragStart?: (e: React.DragEvent, task: Task) => void;
    isDragging?: boolean;
    className?: string;
}

export const TaskItem = ({
    task,
    onToggleComplete,
    onDelete,
    onDragStart,
    isDragging = false,
    className
}: TaskItemProps) => {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart?.(e, task)}
            className={cn(
                "group flex items-center gap-3 p-3 rounded-lg",
                "bg-matrix-surface border border-matrix-border",
                "hover:bg-secondary/50 hover:border-matrix-green/30",
                "transition-all duration-200 hover:shadow-glow",
                "cursor-move select-none",
                isDragging && "opacity-50 scale-95",
                task.completed && "opacity-60",
                className
            )}
        >
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />

            <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id)}
                className="border-matrix-green data-[state=checked]:bg-matrix-green data-[state=checked]:border-matrix-green"
            />

            <span
                className={cn(
                    "flex-1 text-sm font-medium",
                    task.completed && "line-through text-muted-foreground"
                )}
            >
                {task.text}
            </span>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};