/** One of the four matrix zones. */
export type Quadrant = 'urgent_important' | 'important' | 'urgent' | 'neither';

/** A list a task can live in: the backlog or one of the quadrants. */
export type ContainerId = 'unassigned' | Quadrant;

export interface Task {
    id: string;
    text: string;
    quadrant: ContainerId;
    completed: boolean;
    createdAt: string;
}

export interface QuadrantConfig {
    id: Quadrant;
    /** Action verb shown as the zone title and watermark. */
    verb: string;
    /** Classic matrix name, read by screen readers after the verb. */
    title: string;
    /** Short instruction shown next to the verb. */
    description: string;
    /** Shown when the zone has no tasks. */
    emptyMessage: string;
    /** CSS custom property holding the zone color. */
    colorVar: string;
}
