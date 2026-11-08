import { describe, expect, it } from 'vitest';
import type { Task } from '@/types/task';
import { EXPORT_VERSION, createExport, exportFileName, newTasks, parseImport } from './transfer';

const task = (id: string, quadrant: Task['quadrant'] = 'unassigned'): Task => ({
    id,
    text: `Task ${id}`,
    quadrant,
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
});

describe('createExport and parseImport', () => {
    it('reads back what it exports', () => {
        const tasks = [task('a', 'urgent'), { ...task('b'), completed: true }];
        const file = JSON.stringify(createExport(tasks, new Date('2026-11-08T12:00:00.000Z')));

        expect(JSON.parse(file)).toMatchObject({ app: 'eisenhower-matrix', version: EXPORT_VERSION, exportedAt: '2026-11-08T12:00:00.000Z' });
        expect(parseImport(file)).toEqual({ ok: true, tasks, skipped: 0 });
    });

    it('accepts a bare list of tasks', () => {
        expect(parseImport(JSON.stringify([task('a')]))).toEqual({ ok: true, tasks: [task('a')], skipped: 0 });
    });

    it('drops invalid items and counts them', () => {
        const file = JSON.stringify(createExport([task('a'), { text: 'no id' } as unknown as Task, task('a')]));
        expect(parseImport(file)).toEqual({ ok: true, tasks: [task('a')], skipped: 2 });
    });

    it('rejects files that are not exports', () => {
        for (const text of ['not json', '{"tasks": []}', '{"app": "other", "tasks": [1]}', '"text"', 'null']) {
            expect(parseImport(text)).toEqual({ ok: false, error: 'This file isn’t an Eisenhower Matrix export.' });
        }
    });

    it('rejects files with no valid tasks', () => {
        expect(parseImport('[]')).toEqual({ ok: false, error: 'This file has no tasks to import.' });
        expect(parseImport(JSON.stringify(createExport([])))).toMatchObject({ ok: false });
    });

    it('rejects files from a newer version', () => {
        const file = JSON.stringify({ ...createExport([task('a')]), version: EXPORT_VERSION + 1 });
        expect(parseImport(file)).toEqual({ ok: false, error: 'This file comes from a newer version of the app.' });
    });
});

describe('exportFileName', () => {
    it('uses the local date', () => {
        expect(exportFileName(new Date(2026, 0, 5, 23, 30))).toBe('eisenhower-tasks-2026-01-05.json');
    });
});

describe('newTasks', () => {
    it('keeps only tasks whose ids are not in the list yet', () => {
        expect(newTasks([task('a'), task('b')], [task('b'), task('c')])).toEqual([task('c')]);
    });
});
