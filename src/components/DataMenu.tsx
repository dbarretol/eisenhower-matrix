import { useRef, type ToggleEvent } from 'react';
import { Download, EllipsisVertical, Upload } from 'lucide-react';

interface DataMenuProps {
    canExport: boolean;
    onExport: () => void;
    onImportFile: (file: File) => void;
}

const MENU_ID = 'data-menu';

const itemClass =
    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-ink hover:bg-plane disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent";

// A small menu next to the theme switch. It's a native popover: it closes on Esc or
// an outside click and gives focus back to its button.
export const DataMenu = ({ canExport, onExport, onImportFile }: DataMenuProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Popovers open in the top layer, so place the menu under its button.
    const placeMenu = (e: ToggleEvent<HTMLDivElement>) => {
        const button = buttonRef.current;
        if (e.newState !== 'open' || !button) return;
        const rect = button.getBoundingClientRect();
        e.currentTarget.style.top = `${rect.bottom + 6}px`;
        e.currentTarget.style.right = `${document.documentElement.clientWidth - rect.right}px`;
    };

    const choose = (action: () => void) => {
        menuRef.current?.hidePopover();
        action();
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                popoverTarget={MENU_ID}
                aria-label="Import and export"
                title="Import and export"
                className="grid size-[34px] place-items-center rounded-lg border border-line bg-plane text-muted transition-colors duration-150 hover:text-ink"
            >
                <EllipsisVertical className="size-4" />
            </button>

            <div
                ref={menuRef}
                id={MENU_ID}
                popover="auto"
                onBeforeToggle={placeMenu}
                className="fixed inset-auto m-0 w-52 rounded-card border border-line bg-card p-1 text-ink shadow-lift"
            >
                <button type="button" disabled={!canExport} onClick={() => choose(onExport)} className={itemClass}>
                    <Download className="size-4 text-muted" />
                    Export tasks
                </button>
                <button type="button" onClick={() => choose(() => fileRef.current?.click())} className={itemClass}>
                    <Upload className="size-4 text-muted" />
                    Import tasks…
                </button>
            </div>

            <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    // Clear it so picking the same file again still fires a change.
                    e.target.value = '';
                    if (file) onImportFile(file);
                }}
            />
        </>
    );
};
