import { useRef, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    closestCorners,
    pointerWithin,
    useSensor,
    useSensors,
    type CollisionDetection,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    type KeyboardCoordinateGetter,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { Task } from '@/types/task';
import { TaskPanel } from '@/components/TaskPanel';
import { TaskItem } from '@/components/TaskItem';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
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

const Index = () => {
    const { tasks, setTasks, addTask, updateTask, deleteTask, moveTask, reorderTask } = useTaskStorage();
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [dragOverContainer, setDragOverContainer] = useState<Task['quadrant'] | null>(null);
    // State before the drag started, used to report the move and to undo a cancelled drag.
    const dragSnapshot = useRef<{ tasks: Task[]; quadrant: Task['quadrant'] } | null>(null);

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
        dragSnapshot.current = { tasks, quadrant: task.quadrant };
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
            if (snapshot) setTasks(snapshot.tasks);
            resetDrag();
            return;
        }

        if (active.id !== over.id && !isContainerId(over.id) && findContainer(over.id) === task?.quadrant) {
            reorderTask(String(active.id), String(over.id));
        }

        if (task && snapshot && task.quadrant !== snapshot.quadrant) {
            toast("Task moved", {
                description: `"${task.text}" moved to ${CONTAINER_NAMES[task.quadrant]}`,
            });
        }
        resetDrag();
    };

    const handleDragCancel = () => {
        if (dragSnapshot.current) setTasks(dragSnapshot.current.tasks);
        resetDrag();
    };

    const handleToggleComplete = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            updateTask(taskId, { completed: !task.completed });
            toast(task.completed ? "Task marked incomplete" : "Task completed!", {
                description: `"${task.text}" has been ${task.completed ? 'marked as incomplete' : 'completed'}`,
            });
        }
    };

    const handleDeleteTask = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        deleteTask(taskId);
        toast.error("Task deleted", {
            description: `"${task?.text}" has been removed`,
        });
    };

    const handleAddTask = (text: string) => {
        addTask(text);
        toast("Task added", {
            description: `"${text}" added to your backlog`,
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
        >
            <div className="min-h-screen bg-matrix-bg text-foreground flex">
                <TaskPanel
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    isDragOver={dragOverContainer === 'unassigned'}
                />

                <EisenhowerMatrix
                    tasks={tasks}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDeleteTask}
                    dragOverContainer={dragOverContainer}
                />
            </div>

            <DragOverlay>
                {activeTask ? <TaskItem task={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default Index;
