import TelegramBot from 'node-telegram-bot-api';

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
