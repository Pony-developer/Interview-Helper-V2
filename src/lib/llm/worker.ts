/// <reference lib="webworker" />
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

// Runs the model off the main thread so the loading animation stays smooth.
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
