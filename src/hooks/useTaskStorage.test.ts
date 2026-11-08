import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BACKUP_KEY, STORAGE_KEY, loadTasks, useTaskStorage } from './useTaskStorage';

const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

beforeEach(() => {
    localStorage.clear();
});

describe('loadTasks', () => {
    it('returns an empty list when nothing is saved', () => {
        expect(loadTasks()).toEqual([]);
    });

    it('loads and cleans saved tasks', () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([
            { id: 'a', text: 'Saved', quadrant: 'urgent', completed: true, createdAt: '2026-01-01T00:00:00.000Z' },
            { id: 'a', text: 'Duplicate' },
        ]));
        expect(loadTasks()).toEqual([
            { id: 'a', text: 'Saved', quadrant: 'urgent', completed: true, createdAt: '2026-01-01T00:00:00.000Z' },
        ]);
    });

    it('backs up unreadable data and starts empty', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        localStorage.setItem(STORAGE_KEY, '{not json');

        expect(loadTasks()).toEqual([]);
        expect(localStorage.getItem(BACKUP_KEY)).toBe('{not json');
    });
});

describe('useTaskStorage', () => {
    it('starts with the saved tasks and does not overwrite them', () => {
        const stored = [{ id: 'a', text: 'Saved', quadrant: 'important', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

        const { result } = renderHook(() => useTaskStorage());

        expect(result.current.tasks).toEqual(stored);
        expect(saved()).toEqual(stored);
    });

    it('adds, completes, moves and deletes tasks, saving each change', () => {
        const { result } = renderHook(() => useTaskStorage());

        act(() => result.current.addTask('  First  '));
        act(() => result.current.addTask('   '));
        expect(result.current.tasks).toHaveLength(1);
        const [first] = result.current.tasks;
        expect(first).toMatchObject({ text: 'First', quadrant: 'unassigned', completed: false });

        act(() => result.current.updateTask(first.id, { completed: true }));
        act(() => result.current.moveTask(first.id, 'urgent_important'));
        expect(saved()).toEqual([{ ...first, completed: true, quadrant: 'urgent_important' }]);

        act(() => result.current.deleteTask(first.id));
        expect(result.current.tasks).toEqual([]);
        expect(saved()).toEqual([]);

        act(() => result.current.restoreTask({ ...first, completed: true, quadrant: 'urgent_important' }, 0));
        expect(result.current.tasks).toHaveLength(1);
    });

    it('waits to save while saving is paused, then saves the latest tasks', () => {
        const { result } = renderHook(() => useTaskStorage());
        act(() => result.current.addTask('A'));
        const [a] = result.current.tasks;

        act(() => result.current.setSavingPaused(true));
        act(() => result.current.moveTask(a.id, 'urgent'));
        act(() => result.current.moveTask(a.id, 'important'));
        expect(saved()).toEqual([a]);

        act(() => result.current.setSavingPaused(false));
        expect(saved()).toEqual([{ ...a, quadrant: 'important' }]);
    });

    it('reorders tasks', () => {
        const { result } = renderHook(() => useTaskStorage());
        act(() => {
            result.current.addTask('A');
            result.current.addTask('B');
        });
        const [a, b] = result.current.tasks;

        act(() => result.current.reorderTask(b.id, a.id));

        expect(result.current.tasks.map(t => t.text)).toEqual(['B', 'A']);
    });
});
