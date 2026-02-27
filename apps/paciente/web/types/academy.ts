
export type LessonType = 'video' | 'quiz' | 'reading' | 'interactive';

export type QuestionType = 'multiple-choice' | 'true-false' | 'matching' | 'fill-gap';

export interface Question {
    id: string;
    type: QuestionType;
    question: string;
    options?: string[]; // For multiple choice
    correctAnswer: string | string[] | { [key: string]: string };
    explanation?: string;
    points: number;
}

export interface LessonContent {
    id: string;
    type: LessonType;
    title: string;
    description: string;
    content?: string; // Markdown or HTML
    videoUrl?: string;
    questions?: Question[];
    durationMinutes: number;
}

export interface LessonNode {
    id: string;
    title: string;
    description: string;
    status: 'locked' | 'active' | 'completed';
    type: 'lesson' | 'quiz' | 'milestone';
    position: { x: number; y: number }; // For visual layout on the path
    contentId: string; // Links to LessonContent
}

export interface Module {
    id: string;
    title: string;
    description: string;
    order: number;
    nodes: LessonNode[];
    color: string; // Theme color for the module
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    modules: Module[];
    totalXp: number;
    progress: number;
}
