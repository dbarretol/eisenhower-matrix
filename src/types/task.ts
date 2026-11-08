export interface Task {
  id: string;
  text: string;
  quadrant: 'unassigned' | 'urgent_important' | 'important' | 'urgent' | 'neither';
  completed: boolean;
  createdAt: string;
}

export type Quadrant = 'urgent_important' | 'important' | 'urgent' | 'neither';

export interface QuadrantConfig {
  id: Quadrant;
  /** Action verb shown as the zone title and watermark. */
  verb: string;
  /** Classic matrix name, used for screen readers and notifications. */
  title: string;
  /** Short instruction shown next to the verb. */
  description: string;
  /** Shown when the zone has no tasks. */
  emptyMessage: string;
  /** CSS custom property holding the zone color. */
  colorVar: string;
}
