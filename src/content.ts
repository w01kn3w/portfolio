export const profile = {
  name: "Atajan",
  email: "admin@atajan.org",
  github: "https://github.com/annlegion",
  source: "https://github.com/w01kn3w/portfolio",
};

// Owner-configured address from the original repository. Delivery is unverified.
export const technologies = [
  {
    category: "Frontend",
    items: ["React", "TypeScript", "HTML", "CSS", "Canvas 2D"],
  },
  { category: "Backend", items: ["Node.js", "HTTP", "SMTP integration"] },
  { category: "Databases", items: ["No public implementation verified"] },
  {
    category: "Infrastructure",
    items: ["Vite", "GitHub Actions", "GitHub Pages"],
  },
  {
    category: "Tools & automation",
    items: ["Git", "ESLint", "Node test runner"],
  },
] as const;
