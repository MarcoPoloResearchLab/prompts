// @ts-check
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import puppeteer from "puppeteer";
import { run as runAppFlows } from "./specs/app-flows.spec.mjs";

const DEFAULT_PORT = 4173;
const HOST = "127.0.0.1";
const ROOT_DIRECTORY = path.resolve(fileURLToPath(new URL("..", import.meta.url)));

const MIME_MAP = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "application/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".ico", "image/x-icon"]
]);

const contentTypeFor = (filePath) => MIME_MAP.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream";

const resolvePath = (requestPath) => {
  const normalizedPath = decodeURIComponent(requestPath.split("?")[0]);
  const targetPath = normalizedPath.endsWith("/") ? `${normalizedPath}index.html` : normalizedPath;
  const absolutePath = path.resolve(ROOT_DIRECTORY, `.${targetPath}`);
  if (!absolutePath.startsWith(ROOT_DIRECTORY)) {
    throw new Error("Attempted directory traversal");
  }
  return absolutePath;
};

const startStaticServer = (port = DEFAULT_PORT) =>
  new Promise((resolve, reject) => {
    const server = createServer(async (request, response) => {
      try {
        const absolutePath = resolvePath(request.url ?? "/");
        const fileContent = await readFile(absolutePath);
        response.writeHead(200, { "content-type": contentTypeFor(absolutePath) });
        response.end(fileContent);
      } catch (error) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        if (error.message !== "Attempted directory traversal") {
          console.warn(`Static server: ${error.message}`);
        }
      }
    });
    server.once("error", reject);
    server.listen(port, HOST, () => {
      const address = server.address();
      if (typeof address === "object" && address) {
        resolve({ server, port: address.port });
        return;
      }
      reject(new Error("Unable to determine server port"));
    });
  });

const main = async () => {
  const { server, port } = await startStaticServer(0);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const baseUrl = `http://${HOST}:${port}/index.html`;
    await runAppFlows({ browser, baseUrl });
    console.log("All tests passed");
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
