import { Telegraf, Context } from "telegraf";
import { logger } from "../../config/logger";
import { analyzeTranscript } from "../../ai/analyzeTranscript";
import { analyzeSummary } from "../../ai/analyzeSummary";

const MAX_MESSAGE_LENGTH = 4096;

const splitMessage = (
  text: string,
  maxLength = MAX_MESSAGE_LENGTH
): string[] => {
  const chunks: string[] = [];
  let current = 0;

  while (current < text.length) {
    chunks.push(text.slice(current, current + maxLength));
    current += maxLength;
  }

  return chunks;
};

const replyChunks = async (ctx: Context, text: string) => {
  const chunks = splitMessage(text);
  logger.info(`Ответ будет отправлен в ${chunks.length} сообщениях.`);

  for (const chunk of chunks) {
    try {
      await ctx.reply(chunk, { parse_mode: "Markdown" });
    } catch (err) {
      logger.warn(
        "Ошибка при отправке Markdown, пробую без форматирования.",
        err
      );
      await ctx.reply(chunk); // plain text fallback
    }

    await new Promise((res) => setTimeout(res, 300)); // анти-флуд защита
  }
};

export const registerActionHandlers = (bot: Telegraf) => {
  bot.action(/transcribe:(.+)/, async (ctx) => {
    const url = ctx.match[1];
    logger.info(`Пользователь выбрал транскрибацию: ${url}`);

    await ctx.reply("🔄 Транскрибация началась...");

    try {
      const result = await analyzeTranscript(url);
      await replyChunks(ctx, result);
    } catch (e) {
      logger.error(e);
      await ctx.reply("⚠️ Ошибка при транскрибации видео");
    }
  });

  bot.action(/summary:(.+)/, async (ctx) => {
    const url = ctx.match[1];
    logger.info(`Пользователь запросил суть и термины: ${url}`);

    await ctx.reply("🧠 Получаю краткое содержание...");

    try {
      const result = await analyzeSummary(url);
      await replyChunks(ctx, result);
    } catch (e) {
      logger.error(e);
      await ctx.reply("⚠️ Ошибка при анализе содержания");
    }
  });

  bot.action(/cancel:(.+)/, async (ctx) => {
    const url = ctx.match[1];
    logger.info(`Пользователь отменил обработку ссылки: ${url}`);
    await ctx.reply("❌ Обработка отменена");
  });
};
