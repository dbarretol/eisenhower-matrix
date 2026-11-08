import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/utils';

interface TaskInputProps {
    onAddTask: (text: string) => void;
}

export const TaskInput = ({ onAddTask }: TaskInputProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAddTask(inputValue);
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a task"
                aria-label="New task"
                autoComplete="off"
                enterKeyHint="done"
                maxLength={200}
                className={cn(
                    "h-10 min-w-0 flex-1 rounded-card border border-line bg-card px-3 text-ink",
                    "placeholder:text-muted focus-visible:border-ink"
                )}
            />
            <button
                type="submit"
                className="h-10 rounded-card bg-ink px-3.5 text-sm font-bold text-bg transition-opacity duration-150 hover:opacity-90"
            >
                Add
            </button>
        </form>
    );
};
