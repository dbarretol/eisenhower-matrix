import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface TaskInputProps {
    onAddTask: (text: string) => void;
}

export const TaskInput = ({ onAddTask }: TaskInputProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAddTask(inputValue);
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a new task..."
                className="flex-1 bg-matrix-surface border-matrix-border focus:border-matrix-green focus:ring-matrix-green"
            />
            <Button
                type="submit"
                size="sm"
                className="bg-matrix-green hover:bg-matrix-green/90 text-matrix-bg font-semibold shadow-glow"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </form>
    );
};