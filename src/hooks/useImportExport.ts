import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';
import type { Task } from '@/types/task';
import { MAX_IMPORT_BYTES, createExport, exportFileName, newTasks, parseImport } from '@/lib/transfer';

/** Long enough to reach Undo with the keyboard or a screen reader. */
const UNDO_DURATION = 8000;

export const countTasks = (n: number) => `${n} ${n === 1 ? 'task' : 'tasks'}`;

const skippedNote = (skipped: number) =>
    skipped > 0 ? `${skipped} invalid ${skipped === 1 ? 'item was' : 'items were'} skipped.` : undefined;

/** An import that needs a decision because the matrix already has tasks. */
export interface PendingImport {
    tasks: Task[];
    skipped: number;
    /** Imported tasks that aren't in the matrix yet. */
    fresh: Task[];
}

const downloadJson = (data: unknown, fileName: string) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url));
};

/** Exporting tasks to a JSON file and importing them back, with undo. */
export const useImportExport = (tasks: Task[], setTasks: Dispatch<SetStateAction<Task[]>>) => {
    const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

    const exportTasks = () => {
        downloadJson(createExport(tasks), exportFileName());
        toast(`Exported ${countTasks(tasks.length)}`);
    };

    // Adds tasks and offers to take exactly those tasks out again.
    const addTasks = (added: Task[], skipped: number) => {
        const ids = new Set(added.map(t => t.id));
        setTasks(prev => [...prev, ...added.filter(t => !prev.some(p => p.id === t.id))]);
        toast(`Imported ${countTasks(added.length)}`, {
            description: skippedNote(skipped),
            duration: UNDO_DURATION,
            action: { label: 'Undo', onClick: () => setTasks(prev => prev.filter(t => !ids.has(t.id))) },
        });
    };

    const importFile = async (file: File) => {
        if (file.size > MAX_IMPORT_BYTES) {
            toast.error('Couldn’t import tasks', { description: 'This file is too large to be an export.' });
            return;
        }

        const result = parseImport(await file.text());
        if (!result.ok) {
            toast.error('Couldn’t import tasks', { description: result.error });
            return;
        }

        // Nothing to lose or merge with: import right away.
        if (tasks.length === 0) {
            addTasks(result.tasks, result.skipped);
            return;
        }
        setPendingImport({ ...result, fresh: newTasks(tasks, result.tasks) });
    };

    const addPending = () => {
        if (!pendingImport) return;
        addTasks(pendingImport.fresh, pendingImport.skipped);
        setPendingImport(null);
    };

    const replaceWithPending = () => {
        if (!pendingImport) return;
        const previous = tasks;
        setTasks(pendingImport.tasks);
        toast(`Replaced ${countTasks(previous.length)} with ${countTasks(pendingImport.tasks.length)}`, {
            description: skippedNote(pendingImport.skipped),
            duration: UNDO_DURATION,
            action: { label: 'Undo', onClick: () => setTasks(previous) },
        });
        setPendingImport(null);
    };

    return {
        exportTasks,
        importFile,
        pendingImport,
        addPending,
        replaceWithPending,
        cancelImport: () => setPendingImport(null),
    };
};
