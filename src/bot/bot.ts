import { Telegraf } from "telegraf";
import { logger } from "../config/logger";
import { handleStart } from "./handlers/start.handler";
import { handleLink } from "./handlers/link.handler";
import { registerActionHandlers } from "./handlers/actions.handler";
import "dotenv/config";

const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;

if (!TELEGRAM_API_KEY) {
  logger.error("BOT_TOKEN is not set in environment variables");
  process.exit(1);
}

export const bot = new Telegraf(TELEGRAM_API_KEY);

bot.start(handleStart);
bot.on("text", handleLink);

registerActionHandlers(bot);

export const startBot = async () => {
  try {
    await bot.launch(() => {
      logger.info("Telegram-бот успешно запущен ✅");
    });
  } catch (error) {
    logger.error("Ошибка при запуске Telegram-бота:", error);
  }

  process.once("SIGINT", () => {
    logger.warn("SIGINT, останавливаю бота...");
    bot.stop("SIGINT");
  });
  process.once("SIGTERM", () => {
    logger.warn("SIGTERM, останавливаю бота...");
    bot.stop("SIGTERM");
  });
};
