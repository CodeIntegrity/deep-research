import { create } from "zustand";

type TaskStore = {
  question: string;
  questions: string;
  finalReport: string;
  query: string;
  title: string;
  suggestion: string;
  tasks: SearchTask[];
};

type TaskFunction = {
  update: (tasks: SearchTask[]) => void;
  setTitle: (title: string) => void;
  setSuggestion: (suggestion: string) => void;
  setQuery: (query: string) => void;
  updateTask: (query: string, task: Partial<SearchTask>) => void;
  setQuestion: (question: string) => void;
  updateQuestions: (questions: string) => void;
  updateFinalReport: (report: string) => void;
  clear: () => void;
};

export const useTaskStore = create<TaskStore & TaskFunction>((set, get) => ({
  question: "",
  questions: "",
  finalReport: "",
  query: "",
  title: "",
  suggestion: "",
  tasks: [],
  update: (tasks) => set(() => ({ tasks: [...tasks] })),
  setTitle: (title) => set(() => ({ title })),
  setSuggestion: (suggestion) => set(() => ({ suggestion })),
  setQuery: (query) => set(() => ({ query })),
  updateTask: (query, task) => {
    const newTasks = get().tasks.map((item) => {
      return item.query === query ? { ...item, ...task } : item;
    });
    set(() => ({ tasks: [...newTasks] }));
  },
  setQuestion: (question) => set(() => ({ question })),
  updateQuestions: (questions) => set(() => ({ questions })),
  updateFinalReport: (report) => set(() => ({ finalReport: report })),
  clear: () => set(() => ({ tasks: [] })),
}));
