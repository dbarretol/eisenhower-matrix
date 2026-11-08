import { describe, expect, it, vi } from 'vitest';
import type { Task } from '@/types/task';
import { MAX_TASK_LENGTH, createTask, moveTask, reorderTask, restoreTask, sanitizeTasks } from './tasks';

const task = (id: string, quadrant: Task['quadrant'] = 'unassigned'): Task => ({
    id,
    text: `Task ${id}`,
    quadrant,
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
});

const ids = (tasks: Task[]) => tasks.map(t => t.id);

describe('sanitizeTasks', () => {
    it('returns an empty list for anything that is not an array', () => {
        expect(sanitizeTasks(null)).toEqual([]);
        expect(sanitizeTasks({ id: 'a' })).toEqual([]);
        expect(sanitizeTasks('[]')).toEqual([]);
    });

    it('keeps valid tasks unchanged', () => {
        const valid = [task('a'), { ...task('b', 'urgent'), completed: true }];
        expect(sanitizeTasks(valid)).toEqual(valid);
    });

    it('drops items without a string id or text', () => {
        const result = sanitizeTasks([null, 42, { text: 'no id' }, { id: 'x' }, { id: '', text: 'empty id' }, task('a')]);
        expect(ids(result)).toEqual(['a']);
    });

    it('drops repeated ids and keeps the first one', () => {
        const result = sanitizeTasks([task('a'), { ...task('a'), text: 'Duplicate' }, task('b')]);
        expect(ids(result)).toEqual(['a', 'b']);
        expect(result[0].text).toBe('Task a');
    });

    it('trims text, drops blank text and shortens long text', () => {
        const result = sanitizeTasks([
            { ...task('a'), text: '  Padded  ' },
            { ...task('b'), text: '   ' },
            { ...task('c'), text: 'x'.repeat(MAX_TASK_LENGTH + 50) },
        ]);
        expect(ids(result)).toEqual(['a', 'c']);
        expect(result[0].text).toBe('Padded');
        expect(result[1].text).toHaveLength(MAX_TASK_LENGTH);
    });

    it('fills in missing or invalid fields', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-05-05T10:00:00.000Z'));
        const [result] = sanitizeTasks([{ id: 'a', text: 'Old task', quadrant: 'later', completed: 'yes' }]);
        vi.useRealTimers();

        expect(result).toEqual({
            id: 'a',
            text: 'Old task',
            quadrant: 'unassigned',
            completed: false,
            createdAt: '2026-05-05T10:00:00.000Z',
        });
    });
});

describe('createTask', () => {
    it('creates an unsorted, open task with trimmed text', () => {
        const created = createTask('  Write report  ');
        expect(created).toMatchObject({ text: 'Write report', quadrant: 'unassigned', completed: false });
        expect(created.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('creates ids without crypto.randomUUID (non-secure origins)', () => {
        const original = crypto.randomUUID;
        Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
        try {
            const a = createTask('A').id;
            const b = createTask('B').id;
            expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
            expect(a).not.toBe(b);
        } finally {
            Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true });
        }
    });
});

describe('moveTask', () => {
    const tasks = [task('a'), task('b'), task('c', 'important'), task('d', 'important')];

    it('moves a task to the end of another list', () => {
        const result = moveTask(tasks, 'a', 'important');
        expect(ids(result)).toEqual(['b', 'c', 'd', 'a']);
        expect(result.find(t => t.id === 'a')?.quadrant).toBe('important');
    });

    it('places the task before another task', () => {
        const result = moveTask(tasks, 'a', 'important', 'd');
        expect(ids(result)).toEqual(['b', 'c', 'a', 'd']);
    });

    it('goes to the end when the task to insert before does not exist', () => {
        expect(ids(moveTask(tasks, 'a', 'important', 'missing'))).toEqual(['b', 'c', 'd', 'a']);
    });

    it('returns the same list when the task does not exist', () => {
        expect(moveTask(tasks, 'missing', 'urgent')).toBe(tasks);
    });

    it('does not change the original list', () => {
        moveTask(tasks, 'a', 'important');
        expect(ids(tasks)).toEqual(['a', 'b', 'c', 'd']);
        expect(tasks[0].quadrant).toBe('unassigned');
    });
});

describe('reorderTask', () => {
    const tasks = [task('a'), task('b'), task('c')];

    it('moves a task down to the position of another task', () => {
        expect(ids(reorderTask(tasks, 'a', 'c'))).toEqual(['b', 'c', 'a']);
    });

    it('moves a task up to the position of another task', () => {
        expect(ids(reorderTask(tasks, 'c', 'a'))).toEqual(['c', 'a', 'b']);
    });

    it('returns the same list for unknown ids or the same task', () => {
        expect(reorderTask(tasks, 'a', 'a')).toBe(tasks);
        expect(reorderTask(tasks, 'a', 'missing')).toBe(tasks);
        expect(reorderTask(tasks, 'missing', 'a')).toBe(tasks);
    });
});

describe('restoreTask', () => {
    it('puts a deleted task back at its old position', () => {
        expect(ids(restoreTask([task('a'), task('c')], task('b'), 1))).toEqual(['a', 'b', 'c']);
    });

    it('adds the task at the end when the list got shorter', () => {
        expect(ids(restoreTask([task('a')], task('b'), 5))).toEqual(['a', 'b']);
    });

    it('does nothing when the task is already back', () => {
        const tasks = [task('a'), task('b')];
        expect(restoreTask(tasks, task('b'), 0)).toBe(tasks);
    });
});
