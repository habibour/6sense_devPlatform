const { createApp } = require("./app");
const { env } = require("./config/env");

const app = createApp();
const port = Number(env.PORT);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
