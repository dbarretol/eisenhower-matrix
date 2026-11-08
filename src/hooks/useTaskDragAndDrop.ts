import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import {
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type Announcements,
    type DragEndEvent,
    type DragOverEvent,
    type DragStartEvent,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import type { ContainerId, Task } from '@/types/task';
import { CONTAINER_NAMES, isContainerId } from '@/lib/quadrants';
import { collisionDetection, keyboardCoordinates } from '@/lib/dnd';

interface Options {
    tasks: Task[];
    setTasks: Dispatch<SetStateAction<Task[]>>;
    moveTask: (taskId: string, quadrant: ContainerId, beforeTaskId?: string) => void;
    reorderTask: (taskId: string, overTaskId: string) => void;
}

/** Drag-and-drop state, sensors, event handlers and screen reader announcements. */
export const useTaskDragAndDrop = ({ tasks, setTasks, moveTask, reorderTask }: Options) => {
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [dragOverContainer, setDragOverContainer] = useState<ContainerId | null>(null);
    // Tasks as they were before the drag started, restored if the drag is cancelled.
    const dragSnapshot = useRef<Task[] | null>(null);

    const sensors = useSensors(
        // A small distance lets clicks on the checkbox and delete button work normally.
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        // Press-and-hold on touch screens so scrolling still works.
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates })
    );

    const findContainer = (id: UniqueIdentifier): ContainerId | undefined =>
        isContainerId(id) ? id : tasks.find(t => t.id === id)?.quadrant;

    const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : undefined;

    const resetDrag = () => {
        setActiveTaskId(null);
        setDragOverContainer(null);
        dragSnapshot.current = null;
    };

    const onDragStart = ({ active }: DragStartEvent) => {
        const task = tasks.find(t => t.id === active.id);
        if (!task) return;
        setActiveTaskId(task.id);
        dragSnapshot.current = tasks;
    };

    // Moves the task into another list while dragging so the lists can make room for it.
    const onDragOver = ({ active, over }: DragOverEvent) => {
        const to = over ? findContainer(over.id) : undefined;
        setDragOverContainer(to ?? null);
        if (!over || !to) return;

        const from = findContainer(active.id);
        if (!from || from === to) return;

        moveTask(String(active.id), to, isContainerId(over.id) ? undefined : String(over.id));
    };

    const onDragEnd = ({ active, over }: DragEndEvent) => {
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

    const onDragCancel = () => {
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

    return {
        activeTask,
        dragOverContainer,
        /** Props to spread on `DndContext`. */
        dndContextProps: {
            sensors,
            collisionDetection,
            onDragStart,
            onDragOver,
            onDragEnd,
            onDragCancel,
            accessibility: { announcements },
        },
    };
};
