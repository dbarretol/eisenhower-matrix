import type { Task } from '@/types/task';
import { TaskInput } from './TaskInput';
import { TaskList } from './TaskList';
import { Search } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface TaskPanelProps {
    tasks: Task[];
    onAddTask: (text: string) => void;
    onToggleComplete: (taskId: string) => void;
    onDelete: (taskId: string) => void;
    isDragOver: boolean;
}

// The search field only appears once the backlog is long enough to need it.
const SEARCH_THRESHOLD = 6;

export const TaskPanel = ({
    tasks,
    onAddTask,
    onToggleComplete,
    onDelete,
    isDragOver
}: TaskPanelProps) => {
    const [searchTerm, setSearchTerm] = useState('');

    const unassignedTasks = tasks.filter(task => task.quadrant === 'unassigned');
    const showSearch = unassignedTasks.length >= SEARCH_THRESHOLD || searchTerm !== '';
    const query = showSearch ? searchTerm.trim().toLowerCase() : '';
    const filteredTasks = query
        ? unassignedTasks.filter(task => task.text.toLowerCase().includes(query))
        : unassignedTasks;

    const count = unassignedTasks.length;
    const emptyMessage = query
        ? `No backlog tasks match “${searchTerm.trim()}”.`
        : 'Add your first task above. New tasks wait here until you sort them.';

    return (
        <aside
            aria-label="Backlog"
            style={{ '--zone': 'var(--muted)' } as CSSProperties}
            className={cn(
                "flex flex-col gap-5 border-line px-5 pt-7 pb-5",
                "lg:sticky lg:top-0 lg:h-screen lg:border-r",
                "border-b lg:border-b-0"
            )}
        >
            <div>
                <h1 className="font-display text-[26px] leading-none font-bold tracking-[-0.01em] [font-stretch:80%]">
                    Eisenhower Matrix
                </h1>
                <p className="mt-1.5 text-[13px] text-muted">Sort tasks by what matters and what can’t wait.</p>
            </div>

            <TaskInput onAddTask={onAddTask} />

            <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="flex items-baseline justify-between">
                    <h2 className="font-display text-[17px] font-semibold">Backlog</h2>
                    <span className="text-[13px] text-muted tabular-nums">
                        {count} {count === 1 ? 'task' : 'tasks'}
                    </span>
                </div>

                {showSearch && (
                    <div className="relative">
                        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search backlog"
                            aria-label="Search backlog"
                            autoComplete="off"
                            className="h-9 w-full rounded-card border border-line bg-plane pr-3 pl-8 text-sm text-ink placeholder:text-muted focus-visible:border-ink"
                        />
                    </div>
                )}

                <TaskList
                    containerId="unassigned"
                    tasks={filteredTasks}
                    onToggleComplete={onToggleComplete}
                    onDelete={onDelete}
                    emptyMessage={emptyMessage}
                    className={cn(
                        "-m-1 min-h-24 flex-1 overflow-x-hidden overflow-y-auto rounded-card p-1",
                        "outline-2 -outline-offset-1 outline-transparent transition-[outline-color] duration-150",
                        isDragOver && "outline-dashed outline-muted/60"
                    )}
                />
            </div>

            <p className="text-[13px] text-muted">
                Drag a task onto the matrix to sort it. Drag it back here to unsort it.
            </p>
        </aside>
    );
};
