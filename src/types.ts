export type ProjectStatus = "production" | "in_progress" | "archived";

export interface Project {
  id: number | string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  coverImage: string;
  gallery: string[];
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
  published: boolean;
  status: ProjectStatus;
  relatedTo: string;
  sectionArchitecture: string;
  sectionHighlights: string;
  sectionSkills: string;
  sectionNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: number | string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  published: boolean;
}

export interface Tool {
  id: number | string;
  name: string;
  category: string; // e.g., Hardware, Software, Lab
  description: string;
  link?: string;
  icon?: string;
}

export interface ReadingItem {
  id: number | string;
  title: string;
  author: string;
  category: string; // e.g., Engineering, Philosophy, Fiction
  status: 'reading' | 'completed' | 'queued';
  rating?: number;
  review?: string;
  link?: string;
}

export interface Demo {
  id: number | string;
  title: string;
  description: string;
  link: string;
  githubUrl?: string;
  tags: string[];
  thumbnail: string;
}

export interface AboutContent {
  bio: string;
  currentFocus: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  stack: {
    category: string;
    items: string[];
  }[];
  contact: {
    email: string;
    location: string;
    github: string;
    linkedin: string;
  };
}
