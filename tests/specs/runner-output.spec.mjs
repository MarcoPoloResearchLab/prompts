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

export const run = async ({ announceProgress }) => {
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
};
