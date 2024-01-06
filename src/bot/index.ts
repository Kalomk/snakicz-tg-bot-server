import { bot } from '../..';
import { EH_onCallbackQuery, EH_handleStartCommand } from './eventHandlers';
import { group_chat } from '../..';

export const startBot = () => {
  //events
  bot.on('callback_query', (callbackQuery) => EH_onCallbackQuery(callbackQuery, group_chat));
  bot.on('polling_error', console.log);

  const commands = [/\/start/, /\Почати знову/, /\Вийти/, /\/restart/];
  // Command handlers
  bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match![1];
    bot.sendMessage(chatId, resp);
  });

  commands.forEach((command) => {
    bot.onText(command, (msg) => {
      EH_handleStartCommand(msg);
    });
  });
};
