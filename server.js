const { createServer } = require("node:http");
const next = require("next");

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || "0.0.0.0";
const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((request, response) => handle(request, response)).listen(
      port,
      hostname,
      () => {
        console.log(`Turks Without Borders listening on ${hostname}:${port}`);
      },
    );
  })
  .catch((error) => {
    console.error("Unable to start the application.", error);
    process.exit(1);
  });
