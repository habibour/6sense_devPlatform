/*
 * Seeds the local dev database with demo users, posts, comments, and
 * reactions so a fresh clone has something to browse and test against.
 * Wipes existing rows first - never run this against a non-dev database.
 */
const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../src/utils/password");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";

const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

async function main() {
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const [maria, jordan, priya, sam, alex, chen] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Maria Alvarez",
        email: "maria.alvarez@example.com",
        passwordHash,
        bio: "Backend engineer. Postgres, Node.js, and distributed systems.",
        skills: { create: [{ name: "Node.js" }, { name: "PostgreSQL" }, { name: "Docker" }] },
        experiences: {
          create: [
            {
              title: "Senior Backend Engineer",
              company: "Northwind Cloud",
              from: new Date("2022-03-01"),
              description: "Own the payments and billing services.",
            },
          ],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Jordan Lee",
        email: "jordan.lee@example.com",
        passwordHash,
        bio: "Frontend dev. React, TypeScript, and design systems.",
        skills: { create: [{ name: "React" }, { name: "TypeScript" }, { name: "Tailwind CSS" }] },
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Nair",
        email: "priya.nair@example.com",
        passwordHash,
        bio: "Platform engineer focused on CI/CD and observability.",
        skills: { create: [{ name: "Kubernetes" }, { name: "Terraform" }] },
      },
    }),
    prisma.user.create({
      data: {
        name: "Sam Okafor",
        email: "sam.okafor@example.com",
        passwordHash,
        bio: "Full-stack, currently deep in API design.",
        skills: { create: [{ name: "Express" }, { name: "GraphQL" }] },
      },
    }),
    prisma.user.create({
      data: {
        name: "Alex Kim",
        email: "alex.kim@example.com",
        passwordHash,
        bio: "Mobile engineer dabbling in backend.",
        skills: { create: [{ name: "Swift" }, { name: "Node.js" }] },
      },
    }),
    prisma.user.create({
      data: {
        name: "Chen Wu",
        email: "chen.wu@example.com",
        passwordHash,
        bio: "Database internals nerd.",
        skills: { create: [{ name: "PostgreSQL" }, { name: "Redis" }] },
      },
    }),
  ]);

  const posts = [
    {
      author: maria,
      title: "Postgres indexing: when a composite index actually helps",
      body: "Spent a week chasing a slow query and it came down to column order in a composite index. Sharing what I learned about how Postgres picks index scans vs. seq scans.",
      hours: 3,
      likers: [jordan, priya, sam, alex],
      dislikers: [],
      comments: [
        { author: jordan, body: "This bit me too — great writeup." },
        { author: priya, body: "Do you have a benchmark for the before/after?" },
        { author: sam, body: "Bookmarking this for the next migration review." },
      ],
    },
    {
      author: priya,
      title: "Our CI pipeline went from 14 minutes to 4",
      body: "Caching node_modules and Docker layers properly, plus running the test suite in parallel shards. Breakdown of each change and its impact inside.",
      hours: 6,
      likers: [maria, sam, chen],
      dislikers: [],
      comments: [
        { author: chen, body: "Which CI provider are you on? Curious if this generalizes." },
        { author: maria, body: "Parallel shards were the biggest win for us too." },
      ],
    },
    {
      author: sam,
      title: "REST vs. GraphQL for an internal admin dashboard — what we picked",
      body: "We went with REST in the end, mostly for team familiarity and simpler caching. Wrote up the tradeoffs we considered.",
      hours: 9,
      likers: [jordan, alex],
      dislikers: [priya],
      comments: [
        { author: alex, body: "Would love to hear how the caching story played out." },
      ],
    },
    {
      author: jordan,
      title: "A small React hook for debounced search that we actually reuse",
      body: "Every project reinvents this. Here's the version we settled on after a few iterations, plus why the cleanup function matters more than people think.",
      hours: 14,
      likers: [maria, priya, sam, alex, chen],
      dislikers: [],
      comments: [
        { author: sam, body: "Clean. Using this in our next sprint." },
        { author: chen, body: "The cleanup-function point is underrated, agreed." },
      ],
    },
    {
      author: chen,
      title: "Redis as a rate limiter: sliding window vs. token bucket",
      body: "Compared both approaches under bursty traffic. Sliding window log was more accurate but token bucket was cheaper — here's the tradeoff in practice.",
      hours: 20,
      likers: [maria, jordan],
      dislikers: [],
      comments: [],
    },
    {
      author: alex,
      title: "First backend service in Node.js after years of iOS — notes",
      body: "Coming from Swift, the biggest adjustment was embracing async error handling patterns instead of optionals. A few other things that surprised me.",
      hours: 27,
      likers: [maria, sam],
      dislikers: [],
      comments: [
        { author: maria, body: "Welcome to the dark side. The event loop takes some getting used to." },
      ],
    },
  ];

  for (const p of posts) {
    const post = await prisma.post.create({
      data: {
        authorId: p.author.id,
        title: p.title,
        body: p.body,
        createdAt: hoursAgo(p.hours),
        likeCount: p.likers.length,
        dislikeCount: p.dislikers.length,
        commentCount: p.comments.length,
      },
    });

    for (const u of p.likers) {
      await prisma.reaction.create({
        data: { userId: u.id, targetType: "POST", targetId: post.id, type: "LIKE" },
      });
    }
    for (const u of p.dislikers) {
      await prisma.reaction.create({
        data: { userId: u.id, targetType: "POST", targetId: post.id, type: "DISLIKE" },
      });
    }
    for (const c of p.comments) {
      await prisma.comment.create({
        data: {
          postId: post.id,
          authorId: c.author.id,
          body: c.body,
          createdAt: hoursAgo(p.hours - 1),
        },
      });
    }
  }

  console.log(`Seeded ${posts.length} posts across 6 demo users (password: ${DEMO_PASSWORD}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
