// @ts-check
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import puppeteer from "puppeteer";
import { run as runAppFlows } from "./specs/app-flows.spec.mjs";
import { run as runRunnerOutput } from "./specs/runner-output.spec.mjs";

const DEFAULT_PORT = 4173;
const HOST = "127.0.0.1";
const ROOT_DIRECTORY = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const APP_FLOWS_SPEC_NAME = "specs/app-flows.spec.mjs";
const RUNNER_OUTPUT_SPEC_NAME = "specs/runner-output.spec.mjs";
const executedSpecs = [];
const SPEC_REGISTRY = [
  { name: APP_FLOWS_SPEC_NAME, run: runAppFlows, requiresBrowser: true },
  { name: RUNNER_OUTPUT_SPEC_NAME, run: runRunnerOutput, requiresBrowser: false }
];

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
  if (normalizedPath === "/favicon.ico") {
    return path.resolve(ROOT_DIRECTORY, "./assets/img/favicon.svg");
  }
  const targetPath = normalizedPath.endsWith("/") ? `${normalizedPath}index.html` : normalizedPath;
  const absolutePath = path.resolve(ROOT_DIRECTORY, `.${targetPath}`);
  if (!absolutePath.startsWith(ROOT_DIRECTORY)) {
    throw new Error("Attempted directory traversal");
  }
  return absolutePath;
};

const monitorConsoleWarnings = () => {
  const recordedWarnings = [];
  const originalWarn = console.warn;
  console.warn = (...entries) => {
    recordedWarnings.push(entries.map((entry) => String(entry)).join(" "));
    originalWarn(...entries);
  };
  return () => {
    console.warn = originalWarn;
    return recordedWarnings;
  };
};

const monitorConsoleLogs = () => {
  const recordedLogs = [];
  const originalLog = console.log;
  console.log = (...entries) => {
    recordedLogs.push(entries.map((entry) => String(entry)).join(" "));
    originalLog(...entries);
  };
  return {
    stop() {
      console.log = originalLog;
      return [...recordedLogs];
    },
    snapshot() {
      return [...recordedLogs];
    }
  };
};

const createScenarioLogger = (specName) => {
  const records = [];
  const normalizedName = String(specName ?? "").trim() || "unknown-spec";
  return {
    start(description) {
      const label = String(description ?? "").trim();
      const message = `Running ${normalizedName} :: ${label}`;
      console.log(message);
      records.push({ description: label, status: "running" });
    },
    pass(description) {
      const label = String(description ?? "").trim();
      const message = `✓ ${normalizedName} :: ${label}`;
      console.log(message);
      records.push({ description: label, status: "passed" });
    },
    fail(description, error) {
      const label = String(description ?? "").trim();
      const message = `✗ ${normalizedName} :: ${label} — ${error instanceof Error ? error.message : String(error)}`;
      console.log(message);
      records.push({ description: label, status: "failed" });
    },
    records() {
      return [...records];
    }
  };
};

const createCoverageTotals = () => ({
  js: { usedBytes: 0, totalBytes: 0 },
  css: { usedBytes: 0, totalBytes: 0 }
});

const accumulateCoverageTotals = (totals, coverage) => {
  if (coverage && typeof coverage === "object") {
    const jsCoverage = coverage.js ?? null;
    if (jsCoverage) {
      if (Number.isFinite(jsCoverage.usedBytes)) {
        totals.js.usedBytes += jsCoverage.usedBytes;
      }
      if (Number.isFinite(jsCoverage.totalBytes)) {
        totals.js.totalBytes += jsCoverage.totalBytes;
      }
    }
    const cssCoverage = coverage.css ?? null;
    if (cssCoverage) {
      if (Number.isFinite(cssCoverage.usedBytes)) {
        totals.css.usedBytes += cssCoverage.usedBytes;
      }
      if (Number.isFinite(cssCoverage.totalBytes)) {
        totals.css.totalBytes += cssCoverage.totalBytes;
      }
    }
  }
};

const computeCoverageSlot = ({ usedBytes, totalBytes }) => ({
  usedBytes,
  totalBytes,
  percent: totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0
});

const finalizeCoverageSummary = (totals) => {
  const jsSummary = computeCoverageSlot(totals.js);
  const cssSummary = computeCoverageSlot(totals.css);
  const combinedUsed = jsSummary.usedBytes + cssSummary.usedBytes;
  const combinedTotal = jsSummary.totalBytes + cssSummary.totalBytes;
  const totalSummary = {
    usedBytes: combinedUsed,
    totalBytes: combinedTotal,
    percent: combinedTotal > 0 ? (combinedUsed / combinedTotal) * 100 : 0
  };
  return {
    js: jsSummary,
    css: cssSummary,
    total: totalSummary
  };
};

const formatScenarioRecords = (records) =>
  records.map((record) => ({
    name: record.name,
    status: record.status,
    durationMs: record.durationMs
  }));

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
  const stopMonitoringConsoleWarnings = monitorConsoleWarnings();
  const { stop: stopMonitoringConsoleLogs, snapshot: snapshotConsoleLogs } = monitorConsoleLogs();
  let consoleWarnings = [];
  const { server, port } = await startStaticServer(DEFAULT_PORT);
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const baseUrl = `http://${HOST}:${port}/index.html`;
    const announceProgress = async (pageInstance, label) => {
      if (!executedSpecs.includes(label)) {
        executedSpecs.push(label);
      }
      if (pageInstance && typeof pageInstance.evaluateOnNewDocument === "function") {
        await pageInstance.evaluateOnNewDocument((name) => {
          const existing = Array.isArray(window.__PROMPT_BUBBLES_RUNNER_PROGRESS)
            ? window.__PROMPT_BUBBLES_RUNNER_PROGRESS
            : [];
          if (!existing.includes(name)) {
            window.__PROMPT_BUBBLES_RUNNER_PROGRESS = [...existing, name];
          }
        }, label);
      }
    };
    const scenarioRecords = [];
    const coverageTotals = createCoverageTotals();
    const browserSpecs = SPEC_REGISTRY.filter((spec) => spec.requiresBrowser);
    const metaSpecs = SPEC_REGISTRY.filter((spec) => !spec.requiresBrowser);
    for (const spec of browserSpecs) {
      const scenarioRecord = {
        name: spec.name,
        status: "running",
        startedAt: Date.now(),
        durationMs: 0
      };
      scenarioRecords.push(scenarioRecord);
      console.log(`Running ${spec.name}`);
      const scenarioLogger = createScenarioLogger(spec.name);
      try {
        const result = await spec.run({
          browser,
          baseUrl,
          announceProgress: (page) => announceProgress(page, spec.name),
          reportScenario: scenarioLogger,
          logs: snapshotConsoleLogs()
        });
        scenarioRecord.status = "passed";
        scenarioRecord.durationMs = Date.now() - scenarioRecord.startedAt;
        scenarioRecord.scenarios = scenarioLogger.records();
        accumulateCoverageTotals(coverageTotals, result?.coverage ?? null);
        console.log(`✓ ${spec.name}`);
      } catch (error) {
        scenarioRecord.status = "failed";
        scenarioRecord.durationMs = Date.now() - scenarioRecord.startedAt;
        scenarioRecord.scenarios = scenarioLogger.records();
        globalThis.__PROMPT_BUBBLES_TEST_PROGRESS = {
          scenarios: formatScenarioRecords(scenarioRecords)
        };
        throw error;
      }
    }
    const coverageSummary = finalizeCoverageSummary(coverageTotals);
    globalThis.__PROMPT_BUBBLES_COVERAGE_SUMMARY = coverageSummary;
    globalThis.__PROMPT_BUBBLES_TEST_PROGRESS = {
      scenarios: formatScenarioRecords(scenarioRecords)
    };
    if (coverageSummary.total.totalBytes > 0) {
      const coverageLine = [
        `Coverage summary: Total ${coverageSummary.total.percent.toFixed(2)}% (${coverageSummary.total.usedBytes}/${coverageSummary.total.totalBytes} bytes)`,
        `JS ${coverageSummary.js.percent.toFixed(2)}% (${coverageSummary.js.usedBytes}/${coverageSummary.js.totalBytes})`,
        `CSS ${coverageSummary.css.percent.toFixed(2)}% (${coverageSummary.css.usedBytes}/${coverageSummary.css.totalBytes})`
      ].join(" | ");
      console.log(coverageLine);
    } else {
      console.log("Coverage summary: No instrumented sources were exercised");
    }
    for (const spec of metaSpecs) {
      const startTimestamp = Date.now();
      console.log(`Running ${spec.name}`);
      const scenarioLogger = createScenarioLogger(spec.name);
      try {
        await spec.run({
          browser,
          baseUrl,
          announceProgress: (_, label) => announceProgress(undefined, label ?? spec.name),
          reportScenario: scenarioLogger,
          logs: snapshotConsoleLogs()
        });
        scenarioRecords.push({
          name: spec.name,
          status: "passed",
          durationMs: Date.now() - startTimestamp
        });
        globalThis.__PROMPT_BUBBLES_TEST_PROGRESS = {
          scenarios: formatScenarioRecords(scenarioRecords)
        };
        console.log(`✓ ${spec.name}`);
      } catch (error) {
        scenarioRecords.push({
          name: spec.name,
          status: "failed",
          durationMs: Date.now() - startTimestamp
        });
        globalThis.__PROMPT_BUBBLES_TEST_PROGRESS = {
          scenarios: formatScenarioRecords(scenarioRecords)
        };
        throw error;
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
    consoleWarnings = stopMonitoringConsoleWarnings();
    const recordedLogs = stopMonitoringConsoleLogs();
    globalThis.__PROMPT_BUBBLES_RUNNER_LOGS = recordedLogs;
  }
  const staticServerWarnings = consoleWarnings.filter((message) => message.startsWith("Static server:"));
  if (staticServerWarnings.length > 0) {
    throw new Error(`Static server emitted warnings:\n${staticServerWarnings.join("\n")}`);
  }
  if (executedSpecs.length > 0) {
    console.log(`Executed specs: ${executedSpecs.join(", ")}`);
  }
  console.log("All tests passed");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
