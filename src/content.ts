export const profile = {
  name: "Atajan",
  email: "admin@atajan.org",
  github: "https://github.com/w01kn3w",
};

export interface Project {
  slug: string;
  title: string;
  description: string;
  year: string;
  category: string;
  preview?: "portfolio";
  technologies: readonly string[];
  sourceUrl: string;
  liveUrl?: string;
}

// Add only published work. The archive and navigation count update together.
export const projects: readonly Project[] = [
  {
    slug: "portfolio",
    title: "Место для своих идей",
    description:
      "Этот сайт. Личное портфолио, интерактивная графика и открытый исходный код. Первая запись в коллекции, которая будет расти.",
    year: "2026",
    category: "Личный проект",
    preview: "portfolio",
    technologies: ["React", "TypeScript", "Canvas"],
    sourceUrl: "https://github.com/w01kn3w/portfolio",
  },
];
