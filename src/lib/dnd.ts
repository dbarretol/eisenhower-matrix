import {
    closestCorners,
    defaultDropAnimationSideEffects,
    pointerWithin,
    type CollisionDetection,
    type DropAnimation,
    type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CONTAINER_IDS, isContainerId } from '@/lib/quadrants';

// Prefer the task under the pointer, then the list under the pointer; dropping
// outside every list cancels the drag. Keyboard dragging has no pointer, so it
// uses the closest droppable instead.
export const collisionDetection: CollisionDetection = (args) => {
    if (!args.pointerCoordinates) return closestCorners(args);

    const hits = pointerWithin(args);
    const taskHit = hits.find(hit => !isContainerId(hit.id));
    return taskHit ? [taskHit] : hits.slice(0, 1);
};

// Left/Right jump to the nearest list on that side; Up/Down move through the list
// (and into the list above or below) using the default sortable behavior.
export const keyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
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
export const LIFT_ROTATION = '-1.5deg';

export const dropAnimation: DropAnimation = {
    duration: 220,
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    keyframes: ({ transform }) => [
        { transform: CSS.Transform.toString(transform.initial), rotate: LIFT_ROTATION },
        { transform: CSS.Transform.toString(transform.final), rotate: '0deg' },
    ],
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0' } } }),
};
