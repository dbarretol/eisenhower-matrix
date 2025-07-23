import { Task } from '@/types/task';
import { TaskItem } from './TaskItem';
import { TaskInput } from './TaskInput';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface TaskPanelProps {
    tasks: Task[];
    onAddTask: (text: string) => void;
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    onDragStart: (e: React.DragEvent, task: Task) => void;
    draggedTaskId: string | null;
}

export const TaskPanel = ({
    tasks,
    onAddTask,
    onToggleComplete,
    onDelete,
    onDragStart,
    draggedTaskId
}: TaskPanelProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const unassignedTasks = tasks.filter(task => task.quadrant === 'unassigned');
    const filteredTasks = unassignedTasks.filter(task =>
        task.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-80 h-full bg-gradient-matrix border-r border-matrix-border flex flex-col">
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
                        className="pl-10 bg-matrix-surface border-matrix-border focus:border-matrix-green"
                    />
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-3">
                    {filteredTasks.length > 0 ? (
                        filteredTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggleComplete={onToggleComplete}
                                onDelete={onDelete}
                                onDragStart={onDragStart}
                                isDragging={draggedTaskId === task.id}
                                className="animate-fade-in"
                            />
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            {searchTerm ? 'No tasks match your search.' : 'No tasks yet. Add one above!'}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-matrix-border">
                <div className="text-xs text-muted-foreground text-center">
                    Drag tasks to the matrix →
                </div>
            </div>
        </div>
    );
};