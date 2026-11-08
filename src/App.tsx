import { DndContext, DragOverlay } from '@dnd-kit/core';
import { toast } from 'sonner';
import { TaskPanel } from '@/components/TaskPanel';
import { TaskItem } from '@/components/TaskItem';
import { EisenhowerMatrix } from '@/components/EisenhowerMatrix';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DataMenu } from '@/components/DataMenu';
import { ImportDialog } from '@/components/ImportDialog';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/useTheme';
import { useTaskStorage } from '@/hooks/useTaskStorage';
import { useTaskDragAndDrop } from '@/hooks/useTaskDragAndDrop';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useImportExport } from '@/hooks/useImportExport';
import { LIFT_ROTATION, dropAnimation } from '@/lib/dnd';

const App = () => {
    const { tasks, setTasks, setSavingPaused, addTask, updateTask, deleteTask, moveTask, reorderTask, restoreTask } =
        useTaskStorage();
    const { theme, setTheme } = useTheme();
    const reducedMotion = usePrefersReducedMotion();
    const { activeTask, dragOverContainer, dndContextProps } = useTaskDragAndDrop({
        tasks,
        setTasks,
        moveTask,
        reorderTask,
        setSavingPaused,
    });

    const { exportTasks, importFile, pendingImport, addPending, replaceWithPending, cancelImport } =
        useImportExport(tasks, setTasks);

    const handleToggleComplete = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) updateTask(taskId, { completed: !task.completed });
    };

    const handleDeleteTask = (taskId: string) => {
        const index = tasks.findIndex(t => t.id === taskId);
        if (index === -1) return;
        const task = tasks[index];
        deleteTask(taskId);
        toast('Task deleted', {
            description: `“${task.text}”`,
            // Long enough to reach Undo with the keyboard or a screen reader.
            duration: 8000,
            action: {
                label: 'Undo',
                onClick: () => restoreTask(task, index),
            },
        });
    };

    return (
        <>
            <DndContext {...dndContextProps}>
                <div className="min-h-full lg:grid lg:grid-cols-[300px_1fr]">
                    <TaskPanel
                        tasks={tasks}
                        onAddTask={addTask}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDeleteTask}
                        isDragOver={dragOverContainer === 'unassigned'}
                        activeTaskId={activeTask?.id}
                    />

                    <main className="flex min-w-0 flex-col px-5 pt-5 pb-6 lg:h-screen lg:px-7 lg:pb-7">
                        <div className="mb-2.5 flex justify-end gap-2">
                            <ThemeToggle theme={theme} onChange={setTheme} />
                            <DataMenu canExport={tasks.length > 0} onExport={exportTasks} onImportFile={importFile} />
                        </div>
                        <EisenhowerMatrix
                            tasks={tasks}
                            onToggleComplete={handleToggleComplete}
                            onDelete={handleDeleteTask}
                            dragOverContainer={dragOverContainer}
                        />
                    </main>
                </div>

                <DragOverlay
                    dropAnimation={reducedMotion ? null : dropAnimation}
                    style={{ rotate: LIFT_ROTATION }}
                    className={reducedMotion ? undefined : 'animate-[lift_150ms_cubic-bezier(0.22,1,0.36,1)]'}
                >
                    {activeTask ? <TaskItem task={activeTask} isOverlay /> : null}
                </DragOverlay>
            </DndContext>

            {pendingImport && (
                <ImportDialog
                    pending={pendingImport}
                    currentCount={tasks.length}
                    onAdd={addPending}
                    onReplace={replaceWithPending}
                    onCancel={cancelImport}
                />
            )}

            <Toaster />
        </>
    );
};

export default App;
