import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import { FormData } from './types';

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

export async function UT_sendImageToCloud(image: FormData) {
  const values = { email: 'denkluch88@gmail.com', password: 'lublukiski777' };

  const jwtToken = (await axios.post('https://snakicz-bot.net/cloud/store/auth/signin', values))
    .data;

  const url = 'https://snakicz-bot.net/cloud/store/files/uploadFile';

  try {
    const res = (
      await axios.post(url, image, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${jwtToken}`,
        },
      })
    ).data;
    return res;
  } catch (e) {
    throw new Error(e?.toString());
  }
}
