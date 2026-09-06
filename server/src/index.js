const { createApp } = require("./app");
const { env } = require("./config/env");

// Split from app.js so tests can import createApp() and exercise the app with
// supertest without actually binding a port.
const app = createApp();
const port = Number(env.PORT);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
