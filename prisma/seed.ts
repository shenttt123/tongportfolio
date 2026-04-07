import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.project.deleteMany();

  await prisma.project.createMany({
    data: [
      {
        title: "CO Monitoring System",
        slug: "co-monitoring-system",
        summary:
          "ESP32-based monitoring system with MQTT, server dashboard, and mobile app.",
        content: "Detailed project write-up in markdown or structured rich text.",
        category: "IoT",
        tags: ["ESP32", "MQTT", "Node.js", "Flutter"],
        coverImage: "https://picsum.photos/seed/co-mon/1200/800",
        gallery: [
          "https://picsum.photos/seed/co-mon-1/1200/800",
          "https://picsum.photos/seed/co-mon-2/1200/800",
        ],
        githubUrl: "https://github.com/shenttt123/co-monitoring",
        demoUrl: "https://co-mon.demo.sys",
        featured: true,
        published: true,
        createdAt: new Date("2026-04-06T00:00:00.000Z"),
        updatedAt: new Date("2026-04-06T00:00:00.000Z"),
      },
      {
        title: "Custom RTOS Kernel",
        slug: "custom-rtos-kernel",
        summary: "A priority-based preemptive RTOS kernel for ARM Cortex-M4.",
        content: "A deep dive into the kernel implementation...",
        category: "Embedded",
        tags: ["C", "ARM", "RTOS", "Assembly"],
        coverImage: "https://picsum.photos/seed/rtos/1200/800",
        gallery: [],
        githubUrl: "https://github.com/shenttt123/custom-rtos",
        demoUrl: "",
        featured: true,
        published: true,
        createdAt: new Date("2026-03-12T00:00:00.000Z"),
        updatedAt: new Date("2026-03-12T00:00:00.000Z"),
      },
    ],
  });

  const siteHomeSeed = {
    portraitImagePath: "https://picsum.photos/seed/engineer-portrait/400/400",
    shortIntro: "Embedded systems engineer — firmware, protocols, and reliable hardware.",
    heroText: "Building deterministic systems at the edge",
    technicalFocusTags: ["Firmware", "RTOS", "Embedded Linux", "Hardware bring-up"],
    contactPreviewLinks: [
      { label: "Email", url: "mailto:tsh9714@gmail.com" },
      { label: "GitHub", url: "https://github.com/shenttt123" },
    ],
  };
  await prisma.siteHome.upsert({
    where: { id: 1 },
    create: { id: 1, ...siteHomeSeed },
    update: siteHomeSeed,
  });

  const aboutSeed = {
    bio: "Embedded systems engineer with a focus on high-reliability firmware architecture.",
    currentFocus: ["Hardware-accelerated cryptography", "Rust for embedded"],
    stack: [{ category: "Languages", items: ["C", "C++", "Rust", "Python"] }],
    contact: {
      email: "tsh9714@gmail.com",
      location: "",
      github: "github.com/shenttt123",
      linkedin: "linkedin.com/in/shentong123",
    },
  };
  await prisma.aboutPage.upsert({
    where: { id: 1 },
    create: { id: 1, ...aboutSeed },
    update: aboutSeed,
  });

  await prisma.experience.deleteMany();
  await prisma.experience.create({
    data: {
      company: "TechFlow Systems",
      role: "Senior Embedded Architect",
      startDate: "2022",
      endDate: "",
      location: "Remote / UK",
      summary: "Leading firmware architecture and BSP development.",
      bullets: ["RTOS integration", "Security review"],
      sortOrder: 0,
    },
  });

  await prisma.note.deleteMany();
  await prisma.note.create({
    data: {
      title: "Understanding Preemption and Task Scheduling in FreeRTOS",
      slug: "freertos-scheduling",
      summary:
        "A technical analysis of how the FreeRTOS scheduler handles task priorities.",
      content: "Markdown content here...",
      category: "FreeRTOS",
      tags: ["Scheduling", "Kernel", "RTOS"],
      date: "March 12, 2026",
      readTime: "8 min",
      published: true,
    },
  });

  await prisma.tool.deleteMany();
  await prisma.tool.createMany({
    data: [
      {
        title: "Saleae Logic Pro 16",
        category: "Lab",
        description: "High-performance logic analyzer for protocol debugging.",
        link: "https://saleae.com",
        tags: [],
        published: true,
        sortOrder: 0,
      },
      {
        title: "VS Code + PlatformIO",
        category: "Software",
        description: "Primary IDE for embedded development.",
        link: "",
        tags: [],
        published: true,
        sortOrder: 1,
      },
    ],
  });

  await prisma.readingItem.deleteMany();
  await prisma.readingItem.createMany({
    data: [
      {
        title: "The Pragmatic Programmer",
        type: "completed",
        author: "Andrew Hunt",
        link: "",
        summary: "",
        category: "Engineering",
        recommended: true,
        sortOrder: 0,
      },
      {
        title: "Clean Architecture",
        type: "reading",
        author: "Robert C. Martin",
        link: "",
        summary: "",
        category: "Engineering",
        recommended: false,
        sortOrder: 1,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
