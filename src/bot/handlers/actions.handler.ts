import { Telegraf, Context } from "telegraf";
import { logger } from "../../config/logger";
import { analyzeTranscript } from "../../ai/analyzeTranscript";
import { analyzeSummary } from "../../ai/analyzeSummary";
import escapeMarkdownV2 from "../../utils/escapeMarkdown";

const MAX_MESSAGE_LENGTH = 4096;

function sanitizeMarkdownV2(text: string): string {
  // 1. Удаляем только то, что точно не нужно. Например, заголовки (#...) и картинки ![...](...).
  // Если хотим оставить ссылки [текст](url) — не трогаем их.
  text = text.replace(/^#+\s*/gm, "");
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1");
  return text;
}

function splitMessage(text: string, maxLength = MAX_MESSAGE_LENGTH): string[] {
  const chunks: string[] = [];
  let current = 0;
  while (current < text.length) {
    chunks.push(text.slice(current, current + maxLength));
    current += maxLength;
  }
  return chunks;
}

/**
 * Отправляем сообщение с parse_mode: "MarkdownV2", экранируя опасные символы.
 */
async function replyChunks(ctx: Context, text: string) {
  // 1. Немного почистим
  const sanitized = sanitizeMarkdownV2(text);

  // 2. Экранируем спецсимволы, разрешая корректные пары **...** и _..._
  const escaped = escapeMarkdownV2(sanitized);

  // 3. Разбиваем на куски <= 4096 символов
  const chunks = splitMessage(escaped);

  for (const chunk of chunks) {
    try {
      await ctx.reply(chunk, { parse_mode: "MarkdownV2" });
    } catch (err) {
      logger.warn(
        "Ошибка при отправке MarkdownV2, пробую без форматирования.",
        err
      );
      await ctx.reply(chunk);
    }
    await new Promise((res) => setTimeout(res, 300));
  }
}

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
