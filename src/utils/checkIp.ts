import { logger } from "../config/logger";

export const checkIP = async () => {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const json = (await res.json()) as { ip: string };
    logger.info("[proxy-check] Твой IP:", json.ip);
  } catch (err) {
    logger.error("[proxy-check] Не удалось получить IP:", err);
  }
};
