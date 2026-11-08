import { useEffect, useRef, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    closestCorners,
    defaultDropAnimationSideEffects,
    pointerWithin,
    useSensor,
    useSensors,
    type Announcements,
    type CollisionDetection,
    type DropAnimation,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    type KeyboardCoordinateGetter,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Task } from '@/types/task';
import { TaskPanel } from '@/components/TaskPanel';
import { TaskItem } from '@/components/TaskItem';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useTaskStorage } from '@/hooks/useTaskStorage';
import { CONTAINER_IDS, CONTAINER_NAMES } from '@/lib/quadrants';

const isContainerId = (id: UniqueIdentifier): id is Task['quadrant'] =>
    CONTAINER_IDS.includes(id as Task['quadrant']);

// Prefer the task under the pointer, then the list under the pointer; dropping
// outside every list cancels the drag. Keyboard dragging has no pointer, so it
// uses the closest droppable instead.
const collisionDetection: CollisionDetection = (args) => {
    if (!args.pointerCoordinates) return closestCorners(args);

    const hits = pointerWithin(args);
    const taskHit = hits.find(hit => !isContainerId(hit.id));
    return taskHit ? [taskHit] : hits.slice(0, 1);
};

// Left/Right jump to the nearest list on that side; Up/Down move through the list
// (and into the list above or below) using the default sortable behavior.
const keyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
    const direction = event.code === 'ArrowRight' ? 1 : event.code === 'ArrowLeft' ? -1 : 0;
    if (direction === 0) return sortableKeyboardCoordinates(event, args);

    event.preventDefault();
    const { collisionRect, droppableRects } = args.context;
    if (!collisionRect) return undefined;

    const centerX = collisionRect.left + collisionRect.width / 2;
    const centerY = collisionRect.top + collisionRect.height / 2;
    let target: { left: number; top: number } | undefined;
    let bestDistance = Infinity;

    for (const id of CONTAINER_IDS) {
        const rect = droppableRects.get(id);
        if (!rect) continue;
        const dx = rect.left + rect.width / 2 - centerX;
        // Skip the list the task is in and lists on the other side.
        if (dx * direction <= 0 || (rect.left <= centerX && centerX <= rect.right)) continue;
        const dy = Math.max(rect.top - centerY, 0, centerY - rect.bottom);
        const distance = Math.abs(dx) + dy * 2;
        if (distance < bestDistance) {
            bestDistance = distance;
            target = rect;
        }
    }

    return target ? { x: target.left, y: target.top } : undefined;
};

// The lifted card tilts slightly; on drop it straightens while it settles into place.
const LIFT_ROTATION = '-1.5deg';
const dropAnimation: DropAnimation = {
    duration: 220,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    keyframes: ({ transform }) => [
        { transform: CSS.Transform.toString(transform.initial), rotate: LIFT_ROTATION },
        { transform: CSS.Transform.toString(transform.final), rotate: '0deg' },
    ],
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0' } } }),
};

const usePrefersReducedMotion = () => {
    const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
        query.addEventListener('change', onChange);
        return () => query.removeEventListener('change', onChange);
    }, []);
    return reduced;
};

const Index = () => {
    const { tasks, setTasks, addTask, updateTask, deleteTask, moveTask, reorderTask } = useTaskStorage();
    const { theme, setTheme } = useTheme();
    const reducedMotion = usePrefersReducedMotion();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [dragOverContainer, setDragOverContainer] = useState<Task['quadrant'] | null>(null);
    // Tasks as they were before the drag started, restored if the drag is cancelled.
    const dragSnapshot = useRef<Task[] | null>(null);

    const sensors = useSensors(
        // A small distance lets clicks on the checkbox and delete button work normally.
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        // Press-and-hold on touch screens so scrolling still works.
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates })
    );

    const findContainer = (id: UniqueIdentifier): Task['quadrant'] | undefined =>
        isContainerId(id) ? id : tasks.find(t => t.id === id)?.quadrant;

    const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : undefined;

    const resetDrag = () => {
        setActiveTaskId(null);
        setDragOverContainer(null);
        dragSnapshot.current = null;
    };

    const handleDragStart = ({ active }: DragStartEvent) => {
        const task = tasks.find(t => t.id === active.id);
        if (!task) return;
        setActiveTaskId(task.id);
        dragSnapshot.current = tasks;
    };

    // Moves the task into another list while dragging so the lists can make room for it.
    const handleDragOver = ({ active, over }: DragOverEvent) => {
        const to = over ? findContainer(over.id) : undefined;
        setDragOverContainer(to ?? null);
        if (!over || !to) return;

        const from = findContainer(active.id);
        if (!from || from === to) return;

        moveTask(String(active.id), to, isContainerId(over.id) ? undefined : String(over.id));
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        const snapshot = dragSnapshot.current;
        const task = tasks.find(t => t.id === active.id);

        if (!over) {
            if (snapshot) setTasks(snapshot);
            resetDrag();
            return;
        }

        if (active.id !== over.id && !isContainerId(over.id) && findContainer(over.id) === task?.quadrant) {
            reorderTask(String(active.id), String(over.id));
        }

        resetDrag();
    };

    const handleDragCancel = () => {
        if (dragSnapshot.current) setTasks(dragSnapshot.current);
        resetDrag();
    };

    const taskText = (id: UniqueIdentifier) => tasks.find(t => t.id === id)?.text ?? 'Task';
    const announcements: Announcements = {
        onDragStart: ({ active }) => `Picked up “${taskText(active.id)}”.`,
        onDragOver: ({ active, over }) => {
            // Right after pick-up the task is over itself; keep the pick-up message.
            if (over?.id === active.id) return undefined;
            const to = over ? findContainer(over.id) : undefined;
            return to ? `“${taskText(active.id)}” is over ${CONTAINER_NAMES[to]}.` : undefined;
        },
        onDragEnd: ({ active, over }) => {
            const to = over ? findContainer(over.id) : undefined;
            return to
                ? `Dropped “${taskText(active.id)}” in ${CONTAINER_NAMES[to]}.`
                : `“${taskText(active.id)}” was returned to its place.`;
        },
        onDragCancel: ({ active }) => `Move cancelled. “${taskText(active.id)}” was returned to its place.`,
    };

    const handleToggleComplete = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) updateTask(taskId, { completed: !task.completed });
    };

    const handleDeleteTask = (taskId: string) => {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index === -1) return;
        const task = tasks[index];
        deleteTask(taskId);
        toast("Task deleted", {
            description: `“${task.text}”`,
            action: {
                label: "Undo",
                onClick: () => setTasks(prev => {
                    if (prev.some(t => t.id === task.id)) return prev;
                    const at = Math.min(index, prev.length);
                    return [...prev.slice(0, at), task, ...prev.slice(at)];
                }),
            },
        });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            accessibility={{ announcements }}
        >
            <div className="min-h-full lg:grid lg:grid-cols-[300px_1fr]">
                <TaskPanel
                    tasks={tasks}
                    onAddTask={addTask}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    isDragOver={dragOverContainer === 'unassigned'}
                />

                <main className="flex min-w-0 flex-col px-5 pt-5 pb-6 lg:h-screen lg:px-7 lg:pb-7">
                    <div className="mb-2.5 flex justify-end">
                        <ThemeToggle theme={theme} onChange={setTheme} />
                    </div>
                    <EisenhowerMatrix
                        tasks={tasks}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        dragOverContainer={dragOverContainer}
                    />
                </main>
            </div>

            <DragOverlay
                dropAnimation={reducedMotion ? null : dropAnimation}
                style={{ rotate: LIFT_ROTATION }}
                className={reducedMotion ? undefined : 'animate-[lift_150ms_cubic-bezier(0.22,1,0.36,1)]'}
            >
                {activeTask ? <TaskItem task={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default Index;
