// @ts-check
import { assertEqual } from "../assert.js";

const RUNNER_OUTPUT_SPEC_NAME = "specs/runner-output.spec.mjs";

const isNonEmptyScenarioList = (value) =>
  Boolean(
    value &&
      Array.isArray(value.scenarios) &&
      value.scenarios.length > 0 &&
      value.scenarios.every(
        (scenario) =>
          typeof scenario?.name === "string" &&
          scenario.name.length > 0 &&
          typeof scenario.status === "string"
      )
  );

const hasCoverageSummary = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      typeof value.total === "object" &&
      typeof value.total.percent === "number" &&
      Number.isFinite(value.total.percent)
  );

const findLogIndex = (logs, substring) =>
  Array.isArray(logs) ? logs.findIndex((entry) => String(entry).includes(substring)) : -1;

export const run = async ({ announceProgress, logs }) => {
  if (typeof announceProgress === "function") {
    await announceProgress(undefined, RUNNER_OUTPUT_SPEC_NAME);
  }
  const progressMetadata = globalThis.__PROMPT_BUBBLES_TEST_PROGRESS ?? null;
  assertEqual(
    isNonEmptyScenarioList(progressMetadata),
    true,
    "Test runner should expose scenario progress metadata"
  );
  const coverageSummary = globalThis.__PROMPT_BUBBLES_COVERAGE_SUMMARY ?? null;
  assertEqual(
    hasCoverageSummary(coverageSummary),
    true,
    "Test runner should expose a coverage summary with total percent"
  );
  const allScenariosPassed =
    Array.isArray(progressMetadata?.scenarios) &&
    progressMetadata.scenarios.every((scenario) => scenario.status === "passed");
  assertEqual(allScenariosPassed, true, "All tracked scenarios should report passed status");
  assertEqual(
    Array.isArray(logs) && logs.length > 0,
    true,
    "Runner should capture console log output for verification"
  );
  const runningAppFlowsIndex = findLogIndex(logs, "Running specs/app-flows.spec.mjs");
  const passedAppFlowsIndex = findLogIndex(logs, "✓ specs/app-flows.spec.mjs");
  const coverageLineIndex = findLogIndex(logs, "Coverage summary: Total");
  const runningMetaIndex = findLogIndex(logs, `Running ${RUNNER_OUTPUT_SPEC_NAME}`);
  assertEqual(runningAppFlowsIndex >= 0, true, "Runner logs should announce the app flows spec before execution");
  assertEqual(passedAppFlowsIndex > runningAppFlowsIndex, true, "Runner logs should report app flows completion");
  assertEqual(
    coverageLineIndex > passedAppFlowsIndex,
    true,
    "Runner logs should emit a coverage summary after browser specs complete"
  );
  assertEqual(
    runningMetaIndex > coverageLineIndex,
    true,
    "Runner logs should announce the meta spec after reporting coverage"
  );
};
