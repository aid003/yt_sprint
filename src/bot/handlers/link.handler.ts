import { Context, Markup } from "telegraf";

export const handleLink = async (ctx: Context) => {
  if (!ctx.message || !("text" in ctx.message)) return;

  const messageText = ctx.message.text;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = messageText.match(urlRegex);

  if (!match) {
    return ctx.reply("Пожалуйста, пришли корректную ссылку.");
  }

  const url = match[0];

  await ctx.reply(
    `Получена ссылка: ${url}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("📝 Транскрибация", `transcribe:${url}`)],
      [Markup.button.callback("📚 Суть и термины", `summary:${url}`)],
      [Markup.button.callback("❌ Отмена", `cancel:${url}`)],
    ])
  );
};
