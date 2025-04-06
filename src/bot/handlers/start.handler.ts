import { Context } from "telegraf";

export const handleStart = (ctx: Context) => {
  ctx.reply("Добро пожаловать в бот!");
};
