import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';

// Helper function to send a message with a keyboard
export function UT_sendKeyboardMessage(
  bot: TelegramBot,
  chatId: number,
  text: string,
  keyboard: any
) {
  const options: TelegramBot.SendMessageOptions = {
    parse_mode: 'Markdown',
    reply_markup: {
      one_time_keyboard: true,
      keyboard,
    },
  };
  bot.sendMessage(chatId, text, options);
}

export function removeExtension(filename: string) {
  return filename.replace(/\.[^/.]+$/, '');
}

export function useControllers(app: express.Application) {
  const controllers = fs.readdirSync(path.join(__dirname, 'controllers')).filter((controller) => {
    controller !== 'controller.js' && controller !== 'controller.js.map';
  });
  console.log(controllers);
  controllers.forEach((controller) => {
    const controllerModule = require(`./controllers/${controller}`);

    // Extracting variables from the controller file
    const variables = Object.keys(controllerModule);

    // console.log(controllerModule);
    variables.forEach((moduleObj) => {
      const funcs = Object.keys(controllerModule[moduleObj]);
      funcs.forEach((func) => {
        const controlleName = removeExtension(controller);
        console.log(`/${controlleName}/${func}`);
        app.use(`/${controlleName}/${func}`, controllerModule[moduleObj][func]);
      });
    });
  });
}
