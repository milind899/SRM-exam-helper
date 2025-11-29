import { examContent } from './examContent';
import type { Unit } from './examContent';
import { formalLanguages } from './formalLanguages';
import { computerNetworks } from './computerNetworks';

export interface Subject {
    id: string;
    title: string;
    shortTitle: string;
    examDate: string;
    content: Unit[];
}

export const subjects: Subject[] = [
    {
        id: 'formal-languages',
        title: 'Formal Languages & Automata',
        shortTitle: 'FLA',
        examDate: '2025-12-01T10:00:00',
        content: formalLanguages
    },
    {
        id: 'discrete-math',
        title: 'Discrete Mathematics',
        shortTitle: 'DM',
        examDate: '2025-11-24T14:00:00', // Exam over
        content: examContent
    },
    {
        id: 'computer-networks',
        title: 'Computer Networks',
        shortTitle: 'CN',
        examDate: '2025-11-28T14:00:00',
        content: computerNetworks
    }
];
