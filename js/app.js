// @ts-check

import Alpine from "https://cdn.jsdelivr.net/npm/alpinejs@3.13.5/dist/module.esm.js";
import { STRINGS } from "./constants.js";
import { createPromptsRepository } from "./core/prompts.js";
import { AppShell } from "./ui/appShell.js";
import { applyAuthElementAttributes } from "./ui/authElements.js";
import { applyFooterElementAttributes } from "./ui/footerElements.js";
import { BubbleLayer } from "./ui/bubbleLayer.js";
import { ToastRegion } from "./ui/toast.js";
import { createLogger } from "./utils/logging.js";

const logger = createLogger();
const promptsRepository = createPromptsRepository();

applyAuthElementAttributes();
applyFooterElementAttributes();

document.addEventListener("alpine:init", () => {
  Alpine.data("AppShell", () => AppShell({ promptsRepository, logger }));
  Alpine.data("BubbleLayer", () => BubbleLayer({ logger }));
  Alpine.data("ToastRegion", () => ToastRegion({ logger }));
});

window.Alpine = Alpine;
Alpine.store("app", { strings: STRINGS });
Alpine.start();
