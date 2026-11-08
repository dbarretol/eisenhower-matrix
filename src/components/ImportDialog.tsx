import { useEffect, useRef } from 'react';
import type { PendingImport } from '@/hooks/useImportExport';
import { countTasks } from '@/hooks/useImportExport';

interface ImportDialogProps {
    pending: PendingImport;
    currentCount: number;
    onAdd: () => void;
    onReplace: () => void;
    onCancel: () => void;
}

const buttonBase = "h-9 rounded-card px-3.5 text-sm font-bold transition-opacity duration-150";

// Asks how to import when the matrix already has tasks. Native modal dialog: it traps
// focus, closes on Esc and gives focus back to what had it before.
export const ImportDialog = ({ pending, currentCount, onAdd, onReplace, onCancel }: ImportDialogProps) => {
    const ref = useRef<HTMLDialogElement>(null);
    const addRef = useRef<HTMLButtonElement>(null);

    // The safe choice gets focus; without it (nothing new to add), the first button does.
    useEffect(() => {
        ref.current?.showModal();
        addRef.current?.focus();
    }, []);

    // Closing (not unmounting) lets the browser give focus back. Closing also fires
    // `onClose`, which clears the pending import.
    const finish = (action?: () => void) => {
        action?.();
        ref.current?.close();
    };

    const total = pending.tasks.length;
    const fresh = pending.fresh.length;
    const existing = total - fresh;

    return (
        <dialog
            ref={ref}
            aria-labelledby="import-title"
            aria-describedby="import-summary"
            onClose={onCancel}
            className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-card border border-line bg-card p-5 text-ink shadow-lift backdrop:bg-black/45"
        >
            <h2 id="import-title" className="font-display text-xl font-bold">
                Import {countTasks(total)}?
            </h2>
            <div id="import-summary" className="mt-2 space-y-1 text-sm text-muted">
                {existing > 0 && (
                    <p>
                        {existing === total
                            ? 'All of them are already in your matrix.'
                            : `${existing} of them ${existing === 1 ? 'is' : 'are'} already in your matrix.`}
                    </p>
                )}
                <p>Replacing removes the {countTasks(currentCount)} you have now.</p>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => finish()} className={`${buttonBase} border border-line text-ink hover:bg-plane`}>
                    Cancel
                </button>
                <button type="button" onClick={() => finish(onReplace)} className={`${buttonBase} border border-line text-ink hover:bg-plane`}>
                    Replace all
                </button>
                {fresh > 0 && (
                    <button ref={addRef} type="button" onClick={() => finish(onAdd)} className={`${buttonBase} bg-ink text-bg hover:opacity-90`}>
                        Add {fresh} new {fresh === 1 ? 'task' : 'tasks'}
                    </button>
                )}
            </div>
        </dialog>
    );
};
