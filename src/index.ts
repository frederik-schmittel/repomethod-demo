import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = buildApp({ logger: true });

app
  .listen({ host: config.host, port: config.port })
  .then((address) => {
    app.log.info(`repomethod-demo listening on ${address}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
