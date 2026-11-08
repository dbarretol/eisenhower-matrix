import { describe, expect, it } from 'vitest';
import type { ClientRect, CollisionDetection, KeyboardCoordinateGetter, UniqueIdentifier } from '@dnd-kit/core';
import { collisionDetection, keyboardCoordinates } from './dnd';

const rect = (left: number, top: number, width: number, height: number): ClientRect => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
});

// Desktop layout: backlog on the left, the 2×2 matrix on the right.
const layout = new Map<UniqueIdentifier, ClientRect>([
    ['unassigned', rect(0, 0, 300, 800)],
    ['urgent_important', rect(340, 40, 400, 380)],
    ['important', rect(740, 40, 400, 380)],
    ['urgent', rect(340, 420, 400, 380)],
    ['neither', rect(740, 420, 400, 380)],
]);

type KeyboardArgs = Parameters<KeyboardCoordinateGetter>[1];

const pressKey = (code: string, card: ClientRect) => {
    const event = new KeyboardEvent('keydown', { code, cancelable: true });
    const args = {
        active: 'task',
        currentCoordinates: { x: card.left, y: card.top },
        context: { collisionRect: card, droppableRects: layout },
    } as unknown as KeyboardArgs;
    return { coordinates: keyboardCoordinates(event, args), event };
};

describe('keyboardCoordinates', () => {
    const inBacklog = rect(10, 100, 280, 40);
    const inDo = rect(360, 100, 360, 40);
    const inDelegate = rect(360, 500, 360, 40);

    it('moves from the backlog to the nearest quadrant on the right', () => {
        const { coordinates, event } = pressKey('ArrowRight', inBacklog);
        expect(coordinates).toEqual({ x: 340, y: 40 });
        expect(event.defaultPrevented).toBe(true);
    });

    it('moves between quadrants on the same row', () => {
        expect(pressKey('ArrowRight', inDo).coordinates).toEqual({ x: 740, y: 40 });
        expect(pressKey('ArrowRight', inDelegate).coordinates).toEqual({ x: 740, y: 420 });
    });

    it('moves from a quadrant back to the backlog on the left', () => {
        expect(pressKey('ArrowLeft', inDo).coordinates).toEqual({ x: 0, y: 0 });
    });

    it('stays put when there is no list on that side', () => {
        expect(pressKey('ArrowRight', rect(760, 100, 360, 40)).coordinates).toBeUndefined();
        expect(pressKey('ArrowLeft', inBacklog).coordinates).toBeUndefined();
    });
});

type CollisionArgs = Parameters<CollisionDetection>[0];

const collide = (pointer: { x: number; y: number } | null, extra: [UniqueIdentifier, ClientRect][] = []) => {
    const rects = new Map([...layout, ...extra]);
    const args = {
        active: { id: 'dragged' },
        collisionRect: rect(pointer?.x ?? 360, pointer?.y ?? 100, 200, 40),
        droppableRects: rects,
        droppableContainers: [...rects.keys()].map(id => ({ id, rect: { current: rects.get(id) }, data: { current: {} } })),
        pointerCoordinates: pointer,
    } as unknown as CollisionArgs;
    return collisionDetection(args).map(c => c.id);
};

describe('collisionDetection', () => {
    it('picks the list under the pointer', () => {
        expect(collide({ x: 900, y: 600 })).toEqual(['neither']);
    });

    it('prefers a task under the pointer over its list', () => {
        expect(collide({ x: 400, y: 120 }, [['task-1', rect(360, 100, 360, 40)]])).toEqual(['task-1']);
    });

    it('finds nothing outside every list, so the drop is cancelled', () => {
        expect(collide({ x: 1500, y: 900 })).toEqual([]);
    });

    it('uses the closest list when there is no pointer (keyboard dragging)', () => {
        expect(collide(null)[0]).toBe('urgent_important');
    });
});
