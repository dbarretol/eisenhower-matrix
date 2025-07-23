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
  title: string;
  description: string;
  gradient: string;
  icon: string;
}