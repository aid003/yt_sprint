import { logger } from "./config/logger";
import { startBot } from "./bot/bot";
import { checkIP } from "./utils/checkIp";

(async () => {
  try {
    logger.info("Запуск сервера");

    await checkIP();

    await startBot();
  } catch (error) {
    logger.error("Ошибка при запуске приложения:", error);
    process.exit(1);
  }
})();
