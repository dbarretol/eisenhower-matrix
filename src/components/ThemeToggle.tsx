import { cn } from '@/lib/utils';
import type { Theme } from '@/hooks/useTheme';

interface ThemeToggleProps {
    theme: Theme;
    onChange: (theme: Theme) => void;
}

const OPTIONS: { value: Theme; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
];

export const ThemeToggle = ({ theme, onChange }: ThemeToggleProps) => (
    <div role="group" aria-label="Theme" className="inline-flex gap-0.5 rounded-lg border border-line bg-plane p-[3px]">
        {OPTIONS.map(option => (
            <button
                key={option.value}
                type="button"
                aria-pressed={theme === option.value}
                onClick={() => onChange(option.value)}
                className={cn(
                    "rounded-md px-3 py-1 text-[13px] font-bold text-muted transition-colors duration-150",
                    "hover:text-ink",
                    theme === option.value && "bg-card text-ink shadow-card"
                )}
            >
                {option.label}
            </button>
        ))}
    </div>
);
