import type { Task } from '@/types/task';
import { sanitizeTasks } from '@/lib/tasks';

/** Identifies files exported by this app. */
export const EXPORT_APP = 'eisenhower-matrix';
/** Bumped when the file format changes, so older files can still be read. */
export const EXPORT_VERSION = 1;
/** Larger files are rejected before reading; a real export is a few kilobytes. */
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

export interface ExportFile {
    app: typeof EXPORT_APP;
    version: number;
    exportedAt: string;
    tasks: Task[];
}

export const createExport = (tasks: Task[], now = new Date()): ExportFile => ({
    app: EXPORT_APP,
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    tasks,
});

/** `eisenhower-tasks-2026-11-08.json`, using the local date. */
export const exportFileName = (now = new Date()): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `eisenhower-tasks-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
};

export type ParseResult =
    | { ok: true; tasks: Task[]; skipped: number }
    | { ok: false; error: string };

const NOT_AN_EXPORT = 'This file isn’t an Eisenhower Matrix export.';

/**
 * Reads an exported file. Also accepts a bare list of tasks, like the one the app keeps
 * in browser storage. Invalid items are dropped and counted in `skipped`.
 */
export const parseImport = (text: string): ParseResult => {
    let data: unknown;
    try {
        data = JSON.parse(text);
    } catch {
        return { ok: false, error: NOT_AN_EXPORT };
    }

    let items: unknown;
    if (Array.isArray(data)) {
        items = data;
    } else if (typeof data === 'object' && data !== null && (data as Record<string, unknown>).app === EXPORT_APP) {
        const { version, tasks } = data as Record<string, unknown>;
        if (typeof version === 'number' && version > EXPORT_VERSION) {
            return { ok: false, error: 'This file comes from a newer version of the app.' };
        }
        items = tasks;
    }
    if (!Array.isArray(items)) return { ok: false, error: NOT_AN_EXPORT };

    const tasks = sanitizeTasks(items);
    if (tasks.length === 0) return { ok: false, error: 'This file has no tasks to import.' };
    return { ok: true, tasks, skipped: items.length - tasks.length };
};

/** The imported tasks whose ids aren't already in the list. */
export const newTasks = (current: Task[], incoming: Task[]): Task[] => {
    const ids = new Set(current.map(t => t.id));
    return incoming.filter(t => !ids.has(t.id));
};
