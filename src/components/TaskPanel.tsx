import { Task } from '@/types/task';
import { TaskInput } from './TaskInput';
import { TaskList } from './TaskList';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TaskPanelProps {
    tasks: Task[];
    onAddTask: (text: string) => void;
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    isDragOver: boolean;
}

export const TaskPanel = ({
    tasks,
    onAddTask,
    onToggleComplete,
    onDelete,
    isDragOver
}: TaskPanelProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const unassignedTasks = tasks.filter(task => task.quadrant === 'unassigned');
    const filteredTasks = unassignedTasks.filter(task =>
        task.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <aside
            aria-label="Task backlog"
            className={cn(
                "w-80 h-screen sticky top-0 bg-gradient-matrix border-r border-matrix-border flex flex-col transition-shadow",
                isDragOver && "shadow-glow"
            )}
        >
            <div className="p-6 border-b border-matrix-border">
                <h2 className="text-xl font-bold text-matrix-green mb-4 animate-matrix-glow">
                    Task Backlog
                </h2>
                <TaskInput onAddTask={onAddTask} />
            </div>

            <div className="p-6 border-b border-matrix-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tasks..."
                        aria-label="Search backlog tasks"
                        className="pl-10 bg-matrix-surface border-matrix-border focus:border-matrix-green"
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 p-6 overflow-y-auto">
                <TaskList
                    containerId="unassigned"
                    tasks={filteredTasks}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                    emptyMessage={searchTerm ? 'No tasks match your search.' : 'No tasks yet. Add one above!'}
                    itemClassName="animate-fade-in"
                    className={cn(
                        "h-full rounded-lg border-2 border-dashed border-transparent transition-colors",
                        isDragOver && "border-matrix-green/50"
                    )}
                />
            </div>

            <div className="p-6 border-t border-matrix-border">
                <div className="text-xs text-muted-foreground text-center">
                    Drag tasks to the matrix and back
                </div>
            </div>
        </aside>
    );
};
