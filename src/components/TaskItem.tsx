import type { HTMLAttributes, Ref } from 'react';
import type { Task } from '@/types/task';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps extends HTMLAttributes<HTMLDivElement> {
    task: Task;
    onToggleComplete?: (taskId: string) => void;
    onDelete?: (taskId: string) => void;
    /** The card is being dragged; render the slot it leaves behind. */
    isDragging?: boolean;
    /** The floating copy that follows the pointer while dragging. */
    isOverlay?: boolean;
    ref?: Ref<HTMLDivElement>;
    /** Props for the keyboard drag handle (role, focus and screen reader hints). */
    handleProps?: HTMLAttributes<HTMLButtonElement>;
    handleRef?: Ref<HTMLButtonElement>;
}

// Before a task is deleted, move focus to the next task (or the previous one, or its list)
// so keyboard users don't land at the top of the page.
const focusNeighbor = (card: HTMLElement) => {
    const sibling = (card.nextElementSibling ?? card.previousElementSibling) as HTMLElement | null;
    const handle = sibling?.querySelector<HTMLElement>('[data-drag-handle]');
    const list = card.closest<HTMLElement>('[data-task-list]');
    (handle ?? list)?.focus();
};

export const TaskItem = ({
    task,
    onToggleComplete,
    onDelete,
    isDragging = false,
    isOverlay = false,
    className,
    ref,
    handleProps,
    handleRef,
    ...props
}: TaskItemProps) => {
    return (
        <div
            ref={ref}
            data-task-card
            className={cn(
                "group relative flex items-start gap-2.5 rounded-card border border-line bg-card py-2.5 pr-2 pl-3",
                "shadow-card cursor-grab touch-none select-none",
                "transition-[border-color,box-shadow] duration-150",
                "hover:border-muted/60",
                // The handle is invisible, so the whole card shows its keyboard focus.
                "has-[[data-drag-handle]:focus-visible]:outline-2 has-[[data-drag-handle]:focus-visible]:outline-offset-2 has-[[data-drag-handle]:focus-visible]:outline-ink",
                isDragging && "task-slot",
                isOverlay && "cursor-grabbing border-ink shadow-lift",
                className
            )}
            {...props}
        >
            {/* Pointer and touch drag the whole card; the keyboard drags with this handle,
                so the checkbox and delete button aren't nested inside another control. */}
            {!isOverlay && (
                <button
                    ref={handleRef}
                    type="button"
                    data-drag-handle
                    aria-label={`Move “${task.text}”`}
                    className="sr-only"
                    {...handleProps}
                />
            )}

            <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete?.(task.id)}
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
                onClick={(e) => {
                    const card = e.currentTarget.closest<HTMLElement>('[data-task-card]');
                    if (card) focusNeighbor(card);
                    onDelete?.(task.id);
                }}
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
