import { appendFile } from "node:fs/promises";
const serviceLog = process.env.SERVICE_LOG === "FILE";
const serviceLogFile =
  process.env.SERVICE_LOG_FILE || "~/.logs/ktshia_backend.log";
export async function startServiceLogService() {
  if (serviceLog) {
    if (!serviceLogFile) {
      console.error("Missing or invalid SERVICE_LOG_FILE path.");
      process.exit(1);
    }
  }
}
export default function ExposedFn(
  errorType: "info" | "error",
  message: string,
) {
  CoreService(message, errorType);
  return;
}

async function CoreService(message: string, errorType: "info" | "error") {
  if (errorType === "info") {
    console.log(message);
  } else if (errorType === "error") {
    console.error(message);
  }
  if (serviceLog) {
    await appendFile(
      serviceLogFile,
      `(${new Date().toISOString()}) [${errorType.toUpperCase()}] ${message} \n`,
    );
  }
}
