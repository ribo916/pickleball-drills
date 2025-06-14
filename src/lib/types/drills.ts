export interface Player {
  id: string;
  x: number;
  z: number;
}

export interface Ball {
  x: number;
  z: number;
}

export interface DrillStep {
  note: string;
  players: Player[];
  ball: Ball;
}

export interface Drill {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  players: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goal: string;
  steps: DrillStep[];
}

export interface Category {
  name: string;
  description: string;
}

export interface DrillType {
  name: string;
  description: string;
}

export interface DrillData {
  drills: Drill[];
  categories: Record<string, Category>;
  types: Record<string, DrillType>;
} 