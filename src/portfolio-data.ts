import type {
  PortfolioContent,
  PortfolioDocument,
  PortfolioKind,
  PortfolioLocalized,
} from "./portfolio-types";
const l = (en: string, ru: string): PortfolioLocalized => ({ en, ru });
const entry = (
  kind: PortfolioKind,
  slug: string,
  content: PortfolioContent,
  sortOrder = 0,
) => ({ id: `bundled-${slug}`, kind, slug, sortOrder, content });
// Verified source snapshot. Used only on API failure, never merged with an empty published document.
export const fallbackDocument: PortfolioDocument = {
  version: "bundled-2026-11-18",
  entries: [
    entry("HOMEPAGE", "home", {
      title: l(
        "A clear path from idea to working software.",
        "От идеи до работающего продукта.",
      ),
      description: l(
        "Explore the work, the approach and the tools behind Atajan Labs.",
        "Проекты, подход и технологии Atajan Labs.",
      ),
      sectionOrder: [
        "hero",
        "services",
        "projects",
        "technologies",
        "process",
        "about",
        "contact",
        "cta",
      ],
    }),
    entry("HERO", "hero", {
      title: l(
        "Building digital products that move businesses forward.",
        "Цифровые продукты для развития вашего бизнеса.",
      ),
      description: l(
        "Modern websites, backend systems and thoughtful automation. We turn complex requirements into software that is clear to use and built to last.",
        "Современные сайты, серверные системы и продуманная автоматизация. Превращаем сложные задачи в понятные и надёжные продукты.",
      ),
      buttonLabel: l("Explore projects", "Смотреть проекты"),
      buttonUrl: "#projects",
      secondaryButtonLabel: l("Start a project", "Обсудить проект"),
      secondaryButtonUrl: "#contact",
    }),
    ...[
      [
        "web-development",
        "Web development",
        "Веб-разработка",
        "Websites with purpose. From the first landing page to a complete business presence.",
        "Сайты для конкретных задач: от лендинга до полноценного представительства бизнеса.",
        [
          "Landing pages",
          "Business websites",
          "Corporate websites",
          "E-commerce",
          "Website redesign",
        ],
        [
          "Лендинги",
          "Сайты для бизнеса",
          "Корпоративные сайты",
          "Интернет-магазины",
          "Редизайн",
        ],
      ],
      [
        "backend-development",
        "Backend engineering",
        "Backend-разработка",
        "The systems behind the interface. APIs, data and integrations designed to work together.",
        "Системы за интерфейсом. API, базы данных и интеграции, спроектированные для совместной работы.",
        [
          "Node.js & NestJS",
          "REST APIs",
          "Databases",
          "Authentication",
          "Integrations",
        ],
        [
          "Node.js и NestJS",
          "REST API",
          "Базы данных",
          "Авторизация",
          "Интеграции",
        ],
      ],
      [
        "automation",
        "Automation",
        "Автоматизация",
        "Give repetitive work a reliable workflow. Connect tools and simplify daily operations.",
        "Надёжные процессы для повторяющихся задач. Объединяем инструменты и упрощаем ежедневную работу.",
        [
          "Telegram bots",
          "Business workflows",
          "n8n workflows",
          "CRM automation",
          "Data processing",
        ],
        [
          "Telegram-боты",
          "Бизнес-процессы",
          "Сценарии n8n",
          "Автоматизация CRM",
          "Обработка данных",
        ],
      ],
      [
        "infrastructure",
        "DevOps & infrastructure",
        "DevOps и инфраструктура",
        "A dependable home for your application. Deployment, configuration and ongoing care.",
        "Надёжная среда для приложения. Развёртывание, настройка и дальнейшая поддержка.",
        [
          "Linux administration",
          "VPS setup",
          "Nginx & SSL",
          "Docker",
          "Deployment",
        ],
        [
          "Администрирование Linux",
          "Настройка VPS",
          "Nginx и SSL",
          "Docker",
          "Развёртывание",
        ],
      ],
      [
        "custom-software",
        "Custom software",
        "Заказное ПО",
        "Software that fits the way you work. Focused tools for your team and your customers.",
        "Программы под ваши процессы. Рабочие инструменты для команды и клиентов.",
        [
          "CRM systems",
          "Admin dashboards",
          "Internal applications",
          "Business platforms",
        ],
        [
          "CRM-системы",
          "Панели управления",
          "Внутренние приложения",
          "Бизнес-платформы",
        ],
      ],
    ].map((row, index) =>
      entry(
        "SERVICE",
        row[0] as string,
        {
          title: l(row[1] as string, row[2] as string),
          description: l(row[3] as string, row[4] as string),
          icon: ["window", "server", "workflow", "layers", "code"][index],
          buttonLabel: l("Discuss this service", "Обсудить услугу"),
          buttonUrl: "#contact",
          items: (row[5] as string[]).map((text, i) => ({
            title: l(text, (row[6] as string[])[i]),
          })),
        },
        index,
      ),
    ),
    entry("PROJECT_CATEGORY", "web", {
      title: l("Web experiences", "Веб-проекты"),
    }),
    entry("PROJECT", "atajan-portfolio", {
      title: l("Atajan portfolio", "Портфолио Atajan"),
      description: l(
        "An interactive portfolio built around original graphics, accessible controls and inspectable source.",
        "Интерактивное портфолио с оригинальной графикой, доступными элементами управления и открытым исходным кодом.",
      ),
      body: l(
        "This is an independently built portfolio, not a client case study. Its repository contains the React interface, Canvas artwork, optional Node contact service and the GitHub Pages deployment workflow.",
        "Это самостоятельно разработанное портфолио, а не клиентский кейс. В репозитории доступны React-интерфейс, Canvas-графика, дополнительный Node-сервис для формы связи и конфигурация GitHub Pages.",
      ),
      categorySlug: "web",
      technologySlugs: ["react", "typescript", "nodedotjs", "git"],
      challenge: l(
        "Present technical work honestly without invented clients or performance claims.",
        "Показать техническую работу без вымышленных клиентов и показателей.",
      ),
      solution: l(
        "Source-backed project evidence, original interactive graphics, keyboard controls and a clear contact path.",
        "Подтверждённые исходным кодом проекты, оригинальная интерактивная графика, управление с клавиатуры и понятный способ связи.",
      ),
      githubUrl: "https://github.com/w01kn3w/portfolio",
      liveUrl: "https://atajan.org",
      featured: true,
    }),
    ...[
      ["typescript", "TypeScript"],
      ["javascript", "JavaScript"],
      ["nodedotjs", "Node.js"],
      ["react", "React"],
      ["nextdotjs", "Next.js"],
      ["nestjs", "NestJS"],
      ["postgresql", "PostgreSQL"],
      ["redis", "Redis"],
      ["docker", "Docker"],
      ["linux", "Linux"],
      ["git", "Git"],
    ].map(([slug, title], sortOrder) =>
      entry(
        "TECHNOLOGY",
        slug,
        { title: { en: title }, icon: slug },
        sortOrder,
      ),
    ),
    entry("PROCESS", "process", {
      title: l(
        "Good work starts with a clear process.",
        "Хороший результат начинается с понятного процесса.",
      ),
      description: l(
        "From the first question to the next improvement, you know what is happening and what comes next.",
        "От первого вопроса до следующего улучшения: вы понимаете, на каком этапе проект и что будет дальше.",
      ),
      items: [
        {
          title: l("Discovery", "Знакомство"),
          description: l(
            "We discuss the problem, the people and the business context.",
            "Обсуждаем задачу, пользователей и контекст бизнеса.",
          ),
        },
        {
          title: l("Requirements", "Требования"),
          description: l(
            "We define the scope, priorities and acceptance criteria.",
            "Определяем объём, приоритеты и критерии приёмки.",
          ),
        },
        {
          title: l("Proposal", "Предложение"),
          description: l(
            "You review a clear approach, timeline and quotation.",
            "Вы получаете понятный план, сроки и расчёт стоимости.",
          ),
        },
        {
          title: l("Development", "Разработка"),
          description: l(
            "We build in reviewable steps and share progress.",
            "Разрабатываем поэтапно и показываем промежуточный результат.",
          ),
        },
        {
          title: l("Testing", "Тестирование"),
          description: l(
            "We check behavior, accessibility and integration boundaries.",
            "Проверяем поведение, доступность и взаимодействие систем.",
          ),
        },
        {
          title: l("Delivery", "Передача"),
          description: l(
            "The product ships with documentation and an agreed handover.",
            "Передаём продукт, документацию и инструкции.",
          ),
        },
        {
          title: l("Maintenance", "Поддержка"),
          description: l(
            "We agree on support and the next improvements.",
            "Согласовываем поддержку и дальнейшие улучшения.",
          ),
        },
      ],
    }),
    entry("ABOUT", "about", {
      title: l(
        "Thoughtful engineering. Useful software.",
        "Продуманная разработка. Полезные продукты.",
      ),
      description: l(
        "Atajan Labs is the studio identity of Atajan, a full-stack developer focused on web development, backend engineering and automation.",
        "Atajan Labs — студийный бренд Атаджана, full-stack разработчика с фокусом на веб-разработке, серверных системах и автоматизации.",
      ),
      body: l(
        "The approach is straightforward: understand the need, make deliberate technical choices and build something people can actually use. The work shown here is supported by source code.",
        "Подход прост: разобраться в задаче, осознанно выбрать технологии и создать продукт, которым удобно пользоваться. Представленные здесь работы подтверждены исходным кодом.",
      ),
    }),
    entry("CONTACT", "contact", {
      title: l("Tell us what you have in mind.", "Расскажите о вашей идее."),
      description: l(
        "A new product, a better workflow or an existing system that needs attention. Start with the problem.",
        "Новый продукт, улучшение процесса или доработка существующей системы. Начните с задачи.",
      ),
      email: "wolkannaberdiyew@gmail.com",
      telegramUrl: "https://t.me/atajanlabs_bot",
      githubProfileUrl: "https://github.com/w01kn3w",
      instagramUrl: "https://www.instagram.com/annaberdi_yev/",
    }),
    entry("HOMEPAGE", "final-cta", {
      title: l("Have an idea? Let's build it.", "Есть идея? Давайте воплотим."),
      buttonLabel: l("Start your project", "Начать проект"),
      buttonUrl: "#contact",
    }),
    entry("SEO", "default", {
      title: l(
        "Atajan Labs — Web development, backend & automation",
        "Atajan Labs — Веб-разработка, backend и автоматизация",
      ),
      description: l(
        "Professional websites, backend systems, automation and custom software. Explore verified work and start your project with Atajan Labs.",
        "Профессиональные сайты, серверные системы, автоматизация и заказное ПО. Посмотрите реальные проекты и обсудите свою задачу с Atajan Labs.",
      ),
    }),
  ],
};
