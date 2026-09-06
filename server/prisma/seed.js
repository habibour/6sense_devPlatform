/*
 * Seeds the local dev database with demo users, posts, comments, and
 * reactions so a fresh clone has something to browse and test against.
 * Wipes existing rows first - never run this against a non-dev database.
 */
const { PrismaClient } = require("@prisma/client");
const { hashPassword } = require("../src/utils/password");

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Password123!";

// Backdates createdAt so the ranked feed shows a believable spread of ages instead of
// every demo post/comment appearing to have been created at seed-run time.
const hoursAgo = (h) => new Date(Date.now() - h * 60 * 60 * 1000);

async function main() {
  // Deleted in FK-dependency order (children before parents) — reactions/comments
  // reference posts, posts/experiences/skills reference users.
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
    // The 10 posts below are long-form, so a fresh clone's feed reads like a real
    // populated platform instead of a handful of one-liners. `hours` values are spread
    // from 1 to 220 (alongside the short posts above at 3-27) so the feed shows real
    // recency variation, and engagement is deliberately uneven — a couple of contested
    // posts with real dislikes, a low-reaction "sleeper" carried by its comment thread,
    // and a few strongly-liked posts — rather than everything landing at the top.
    {
      author: sam,
      title: "Async/await debugging war story: the promise that never rejected",
      body: "Spent two days convinced our payment webhook handler was hanging silently in production — no errors in the logs, no timeouts firing, nothing. Health checks were green, the process was alive, but a specific class of webhook just vanished after being received.\n\nTurned out the culprit was a promise created inside a try/catch that awaited a call to a third-party SDK, and that SDK's client had an internal retry queue that swallowed a specific error type before it ever reached our code — it just parked the request forever, waiting on a condition that could never happen because we'd already closed the connection pool it depended on.\n\nThe fix was almost trivial once found: wrap the await in a Promise.race against an explicit timeout, so a stuck call fails loudly instead of hanging invisibly. What made this hard wasn't the code — it was that nothing in our stack treated \"never resolves, never rejects\" as a failure mode worth instrumenting for.\n\nHas anyone else been burned by a promise that just never settles? Curious what monitoring you've put in place to catch that class of bug earlier.",
      hours: 1,
      likers: [jordan],
      dislikers: [],
      comments: [
        { author: chen, body: "The 'never resolves, never rejects' failure mode is so underrated as a monitoring gap." },
        { author: maria, body: "We had almost the exact same thing with a queue client's internal retry logic." },
        { author: priya, body: "Do you alert on promise duration now, or just wrap the specific call sites?" },
        { author: alex, body: "Promise.race with a timeout should honestly be a standard wrapper in every SDK call." },
      ],
    },
    {
      author: chen,
      title: "The 3am page that taught me to distrust my own metrics dashboard",
      body: "Got paged at 3am for elevated p99 latency. Pulled up the dashboard, and the line looked smooth — no obvious spike, nothing that screamed \"real incident.\" Almost went back to sleep on the assumption it was alerting noise.\n\nIt wasn't noise. The metrics aggregation itself was bucketing away the actual spike — the histogram bucket boundaries hid a bimodal distribution where most requests were fast but a meaningful minority were extremely slow, and averaging across buckets smoothed that bimodality into a single, reassuring-looking line.\n\nThe fix was switching from averages to percentile-based SLO dashboards per endpoint, so a fat tail of slow requests shows up as a visible percentile shift instead of getting diluted into a mean. The broader lesson generalized past this one incident: a single aggregate number is almost always lying about something, and \"the dashboard looks fine\" is not the same claim as \"the system is fine.\"\n\nWhat's the worst \"the dashboard says everything's fine\" moment you've had?",
      hours: 2,
      likers: [maria, jordan, priya, sam],
      dislikers: [],
      comments: [
        { author: maria, body: "Averages hiding bimodal latency is such a classic trap. Glad you caught it before it got worse." },
        { author: jordan, body: "We switched every dashboard to p50/p95/p99 after something almost identical happened to us." },
        { author: priya, body: "Do you have a benchmark for the before/after on the SLO dashboards?" },
        { author: alex, body: "Saving this to send to my team next time someone says 'the graph looks flat, must be fine.'" },
      ],
    },
    {
      author: priya,
      title: "Kubernetes readiness probes: the footgun nobody warns you about",
      body: "We had a rollout where pods kept getting killed and restarted in a loop right after deploy, even though the app logs showed it booting fine and serving traffic within a couple seconds locally.\n\nThe readiness probe was hitting an endpoint that itself depended on a downstream service warming up a connection pool. Under load, right after a fresh deploy when all replicas restart at once, that downstream service got hammered by every replica's probe simultaneously and slowed down just enough to fail the probe's timeout — which triggered more restarts, which made the downstream service even slower. A classic thundering herd, except the trigger was our own health check.\n\nThe actual fix was boring: separate the liveness probe (is the process alive) from the readiness probe (can it serve traffic) more strictly, add a startup probe with a generous initial delay, and tune maxSurge/maxUnavailable down instead of leaving the defaults. None of this is exotic, but the probe misconfiguration was invisible until we hit real production load.\n\nIf your readiness probe checks anything beyond \"is my own process responsive,\" it's worth asking what happens when every replica checks that dependency at once.",
      hours: 5,
      likers: [maria, chen],
      dislikers: [],
      comments: [
        { author: sam, body: "The 'health check causes the outage it's supposed to detect' pattern is so easy to miss." },
        { author: jordan, body: "Startup probes fixed a nearly identical issue for us. Underused feature." },
      ],
    },
    {
      author: maria,
      title: "Postmortem: how a missing index took down checkout for 40 minutes",
      body: "Timeline: 14:02 — checkout latency alerts fire, p95 goes from 200ms to over 12 seconds. 14:06 — on-call pages in, checkout success rate starts dropping as clients time out and retry, compounding load on the database. 14:14 — we identify the query: a feature shipped that morning added a filter on orders.promo_code, and that column had no index. 14:22 — index created concurrently in production. 14:31 — latency starts recovering as connections drain. 14:40 — fully recovered.\n\nWhat made this slow to diagnose wasn't the query itself — once we looked, it was an obvious sequential scan on a multi-million row table. It was that the query only got slow once promo codes started actually being used in volume a few hours after launch, so it passed every pre-launch check against a mostly-empty promo_code column.\n\nThe process fix we're adopting: any new WHERE/JOIN/ORDER BY column on a large table gets its index reviewed and added before merge, not discovered after the fact — and our migration review checklist now explicitly asks what the query plan looks like at current table size, not test-fixture size.\n\nAnyone else have an \"it worked in staging because the table was basically empty\" story?",
      hours: 45,
      likers: [jordan, priya, sam, alex, chen],
      dislikers: [],
      comments: [
        { author: chen, body: "Concurrent index creation saving the day mid-incident is a great detail to include." },
        { author: sam, body: "We now require an EXPLAIN ANALYZE on any new filter column in PR review because of a very similar incident." },
        { author: alex, body: "'Worked in staging because the table was basically empty' is way too relatable." },
      ],
    },
    {
      author: jordan,
      title: "We rewrote our design system in 6 weeks and I regret half the decisions",
      body: "Motivation was clear going in: inconsistent spacing tokens across the app, three different button components doing slightly different things, and every new engineer spending their first week just figuring out which button to use. Six weeks felt aggressive but doable for a from-scratch rewrite.\n\nWhat went well: a genuine single source-of-truth token system, and new engineers now ship their first PR noticeably faster because there's exactly one of everything instead of three variants to choose between.\n\nWhat I'd do differently: we badly underestimated migration cost for the roughly 40 existing screens still on the old components. We did a big-bang cutover instead of an incremental codemod, which meant a multi-week stretch where half the app looked like the new system and half looked like the old one, and several screens broke in ways that weren't caught until QA because the visual diff was too large to review carefully in one pass.\n\nIf you're planning a design system rewrite, what's worked for you — big-bang cutover, or incremental screen-by-screen migration? Trying to figure out what we'd do differently next time.",
      hours: 65,
      likers: [priya, sam],
      dislikers: [alex, chen],
      comments: [
        { author: priya, body: "The token system alone would have been worth it for us. Solid write-up." },
        { author: alex, body: "Six weeks for a full rewrite plus migration of 40 screens sounds like it was always going to be rushed, honestly." },
        { author: chen, body: "Big-bang cutovers on visual systems almost never end well in my experience — the QA surface is just too large." },
        { author: sam, body: "Counterpoint: incremental migrations of design systems tend to drag on for a year and never actually finish either." },
        { author: maria, body: "How long did the old/new visual inconsistency period actually last in practice?" },
      ],
    },
    {
      author: sam,
      title: "I finally understand why everyone says 'don't put business logic in controllers'",
      body: "For years this advice felt like something people repeated without really explaining why — \"keep controllers thin\" — until I inherited a codebase where every controller was 200+ lines of validation, business rules, and direct database calls tangled together, and had to add one new rule to an existing flow.\n\nThe rule itself was simple: don't allow a discount code to be applied twice to the same order. But because the logic for \"what counts as applying a discount\" was duplicated across three different controllers (checkout, order-edit, and an internal admin tool), I had to find and patch it in three places, and predictably missed one — which is how a customer got a code applied twice in production.\n\nMoving that logic into a single service function that all three entry points call didn't just make it testable in isolation. It made the next change to that rule a one-line diff instead of a hunt-and-patch exercise across the whole controller layer. It's not an abstract purity argument — it's literally about not repeating yourself in the one place bugs are most expensive to duplicate.\n\nWhat's the rule of thumb you use for when logic has crossed the line from \"controller glue\" into \"needs its own service function\"?",
      hours: 90,
      likers: [maria, jordan, priya, alex, chen],
      dislikers: [],
      comments: [
        { author: maria, body: "This is exactly why our layered architecture keeps controllers to request-parsing only." },
        { author: jordan, body: "The 'missed one of three copies' failure mode is such a common way this bites teams." },
        { author: chen, body: "My rule of thumb: if it touches more than one table or has a conditional that isn't purely about the HTTP request shape, it goes in a service." },
      ],
    },
    {
      author: alex,
      title: "Career advice: I turned down a 30% raise to stay at a smaller company. No regrets.",
      body: "Got an offer from a much bigger company a few months ago — better title, 30% more total comp, a recognizable name for the resume. Turned it down to stay where I am, and I've had a few people ask me if I'm out of my mind.\n\nThe honest reasoning: at the bigger company, the role was scoped narrowly — I'd own one small slice of one service, with three layers of approval to touch anything outside it. Here, I ship things end to end, I've sat in on product decisions, and I've learned more about the parts of the stack I was weakest on — infra, on-call, incident response — in the last year than in the previous three combined.\n\nI'm not saying the money doesn't matter, it obviously does, and for plenty of people at a different life stage 30% is not a close call. But there's a version of \"optimize for comp\" advice that undersells how much scope and ownership compound into skills worth more than the raise, a few years out.\n\nCurious how others have weighed this — has anyone taken the bigger offer and regretted it, or turned it down and regretted that instead?",
      hours: 110,
      likers: [maria, priya],
      dislikers: [jordan, chen],
      comments: [
        { author: jordan, body: "30% is a lot to leave on the table just for scope, respectfully. Compounding comp matters too." },
        { author: priya, body: "Depends heavily on life stage, but I've made a similar call and don't regret it either." },
        { author: chen, body: "Scope and ownership are real, but they don't pay the mortgage. This reads a bit survivorship-bias-y." },
        { author: maria, body: "Both things can be true honestly — this isn't universal advice, just one data point." },
      ],
    },
    {
      author: chen,
      title: "Why I stopped using ORMs for anything performance-sensitive",
      body: "I like ORMs. I still use one for most of our CRUD endpoints because the productivity win is real and most queries genuinely don't need hand-tuning. This isn't an \"ORMs are bad\" post.\n\nBut for our hot-path read queries — the ones hit on every page load, joining across four tables with aggregation — the generated SQL from our ORM was doing things like N+1 loading relations we didn't need, or fetching entire rows when we only needed two columns. Rewriting those specific queries as hand-written SQL, still called from the same codebase via a raw-query escape hatch, cut p95 latency on those endpoints by more than half.\n\nThe pattern I've settled on: default to the ORM everywhere, and treat \"this query shows up in the slow query log\" as the signal to drop to raw SQL for that specific query, not a wholesale migration away from the ORM. Most of an app's queries are not on the hot path and don't need this.\n\nWhere do you draw the line — do you have a rule for when a query earns hand-written SQL?",
      hours: 150,
      likers: [priya, sam],
      dislikers: [jordan],
      comments: [
        { author: priya, body: "Same experience here — the slow query log is a much better trigger than a blanket policy." },
        { author: jordan, body: "I'd rather push the ORM harder with proper eager-loading before reaching for raw SQL, but fair if you've already tried that." },
        { author: sam, body: "N+1 loading relations you don't need is such a sneaky performance killer." },
      ],
    },
    {
      author: jordan,
      title: "The case for boring technology (a rant after our 3rd microservice outage this month)",
      body: "We've had three separate incidents this month, all traceable to the same root-cause pattern: a service using some relatively new, exciting piece of infrastructure that almost nobody on the team has debugged under pressure before. Not because the technology is bad — because when it breaks at 2am, nobody has the muscle memory to diagnose it fast.\n\nEvery one of these choices made sense in isolation when it was adopted. Better performance, a nicer API, solves a real problem the old boring tool didn't. But we now have a system where the incident response runbook for half our services is effectively \"page the one person who set this up and hope they're awake.\"\n\nI'm not against new technology. I'm against paying its \"we don't have institutional debugging experience with this yet\" tax during an incident, repeatedly, without ever accounting for that cost when we adopted it. The pitch for boring technology isn't that boring is better — it's that the org has already paid down the debugging tax on it, and that's worth a lot more at 2am than a slightly nicer API.\n\nHow does your team weigh \"better tool\" against \"tool we can debug under pressure\" when adopting something new?",
      hours: 180,
      likers: [maria, sam, alex],
      dislikers: [chen],
      comments: [
        { author: maria, body: "'Page the one person who set this up' is basically a description of our entire infra team's bus factor." },
        { author: sam, body: "This should be a required reading before every 'let's try this new database' proposal." },
        { author: chen, body: "Counterpoint: if nobody's allowed to try new tools because of the debugging tax, you never build the institutional experience in the first place." },
        { author: priya, body: "Feels like the real fix is deliberate practice — game days on the new tool before it's load-bearing, not avoiding new tools entirely." },
        { author: alex, body: "Agreed with the rant. We adopted three new things in one quarter and paid for all three at once." },
      ],
    },
    {
      author: priya,
      title: "One year of trunk-based development: what actually changed",
      body: "A year ago we moved from long-lived feature branches, some living for weeks, to trunk-based development with small PRs behind feature flags, merged to main multiple times a day. Wanted to share what actually changed versus what we expected going in.\n\nWhat we expected: faster merges, less merge-conflict pain. That happened, but it was a smaller win than we thought — conflicts were annoying but rarely the real bottleneck.\n\nWhat we didn't expect: the biggest change was in code review quality. Small diffs that land the same day get reviewed more carefully than a 2,000-line PR that's been open for a week and everyone's tired of looking at. Bugs that used to slip through in giant PRs got caught earlier simply because reviewers could actually hold the whole diff in their head.\n\nThe cost we underestimated: feature flag hygiene. A year in, we had to run a dedicated cleanup sprint just to remove flags for features that had been fully rolled out for months, because nobody owned deleting them. If you're considering this move, budget for flag cleanup as an ongoing cost, not a one-time setup.",
      hours: 220,
      likers: [maria, jordan, sam, alex, chen],
      dislikers: [],
      comments: [
        { author: sam, body: "Feature flag cleanup debt is real and nobody warns you about it going in." },
      ],
    },
  ];

  for (const p of posts) {
    // likeCount/dislikeCount/commentCount are set directly from the array lengths
    // below rather than left at their schema default and incremented per reaction/
    // comment — this is seed data, not the app's normal write path (which does
    // increment transactionally; see reactions.service.js / comments.service.js).
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
      // `p.hours - 1`: one hour after the post itself, so a comment never appears
      // to predate the post it's replying to.
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
