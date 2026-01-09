
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
}

export interface PerformanceStats {
  score: number;
  bundleSize: string;
  ttfb: string;
  fcp: string;
  optimizationLevel: 'Standard' | 'Aggressive' | 'Ultra';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  files: ProjectFile[];
  status: 'draft' | 'building' | 'testing' | 'stable';
  createdAt: string;
  testReport?: string;
  previewUrl?: string;
  performance?: PerformanceStats;
}

export interface SystemConfig {
  aiModel: string;
  monetizationEnabled: boolean;
  autoTestEnabled: boolean;
  maxUserProjects: number;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  credits: number;
}
