# Discrete Math Tracker

A simple tracker for Discrete Mathematics topics.

## Features
- **Progress Tracking**: Saves my progress automatically so I don't lose it.
- **Repeated Questions**: Highlights questions that keep showing up in past papers.
- **Resources**: Quick links to the playlists and notes I'm using.
- **Search & Filter**: Easy to find specific topics or just see what's left to do.

## Tech Stack
- React + Vite
- Tailwind CSS (Tactical Dark Theme)
- Framer Motion (for the smooth animations)
- Vercel Analytics

## Contribution Guidelines

We welcome contributions! Whether you want to add a new subject, fix a bug, or improve the UI, here's how you can help:

### Adding a New Subject
1.  **Create Data File**: Create a new file in `src/data/` (e.g., `dsa.ts`) following the structure of `examContent.ts`.
2.  **Update Subjects**: Import your new data file in `src/data/subjects.ts` and add a new entry to the `subjects` array.
3.  **Add Resources**: Add relevant resources to `src/data/resources.ts` with the correct `subjectId`.

### Reporting Issues
If you find any errors in the syllabus or questions, please open an issue on GitHub or submit a pull request with the fix.

### Development
1.  Fork the repository.
2.  Clone your fork: `git clone https://github.com/your-username/discrete-math-tracker.git`
3.  Install dependencies: `npm install`
4.  Run the development server: `npm run dev`
5.  Make your changes and push to your fork.
6.  Submit a Pull Request!

## How to Run

```bash
npm install
npm run dev
```

Feel free to fork it if you find it useful!

---
Created by [Milind Shandilya](https://github.com/milind899)
