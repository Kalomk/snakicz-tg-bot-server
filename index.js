const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Constants
const _token = process.env.TOKEN;
const group_chat = process.env.GROUP_CHAT;
const group_chat_for_payment = process.env.GROUP_CHAT_FOR_PAYMENT;
const webAppUrl = process.env.WEB_URL;

let orderNumber;
let userPhoneNumber = '';

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Create Telegram Bot
const bot = new TelegramBot(_token, { polling: true });

bot.on('polling_error', console.log);
// Helper function to send a message with a keyboard
function sendKeyboardMessage(chatId, text, keyboard) {
  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      one_time_keyboard: true,
      keyboard,
    },
  };
  bot.sendMessage(chatId, text, options);
}

function confrimOrder({ chatId, userId, text, messageId, keyboards }) {
  // Create a new array with the first element replaced
  const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
  updatedKeyboards[0] = [
    {
      text: 'Підтверженно!!!',
      callback_data: 'payment_confirmation',
    },
  ];

  const inlineKeyboard = [...updatedKeyboards];

  const paymentButtons = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'ПриватБанк (курс 8.5)',
            callback_data: JSON.stringify({ confirm: 'privat', chat_id: chatId }),
          },
        ],
        [
          {
            text: 'Переказ на польський рахунок',
            callback_data: JSON.stringify({ confirm: 'polish_bank', chat_id: chatId }),
          },
        ],
        [
          {
            text: 'Переказ BLIK за номером телефону',
            callback_data: JSON.stringify({ confirm: 'blik', chat_id: chatId }),
          },
        ],
      ],
    },
  };

  bot.editMessageText(text, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });

  bot.sendMessage(
    userId,
    'Ваше замовлення підтверджено ✅ \n \nБудь ласка, оберіть зручний для Вас спосіб оплати: ',
    paymentButtons
  );
}

function sendPaymentMessage(chatid, type) {
  function checkType() {
    switch (type) {
      case 'privat':
        return 'Ви обрали оплату через Приват банк. Ось номер рахунку для переведення';
      case 'polish_bank':
        return 'Ви обрали спосіб оплати через переведення на польский рахунок. Ось номер рахунку для переведення';
      case 'blik':
        return 'Ви обрали спосіб оплати через Blik. Ось номер телефону, за яким ви можете перевести гроші';
    }
  }

  bot
    .sendMessage(chatid, `${checkType(type)}. Вишліть, будь ласка, фото підтвердження оплати`)
    .then(() => {
      // Listen for messages from the user
      bot.once('message', async (msg) => {
        const chatId = msg.chat.id;

        if (msg.photo && msg.photo.length > 0) {
          // The `msg.photo` property is an array of photo sizes
          // You can access different sizes using indexes (0 - smallest, 2 - largest)
          const photo = msg.photo[2]; // Use the largest available photo
          console.log(msg.photo);
          console.log(photo);

          try {
            // Send the photo to the group chat
            await bot.sendPhoto(group_chat_for_payment, photo.file_id);
            bot.sendMessage(group_chat_for_payment, `Скрін підтвердження №${orderNumber}`);
            bot.sendMessage(
              chatId,
              'Фото підтвердження оплати відправлено 😍\nЧекайте на відправку'
            );
          } catch (error) {
            console.error('Error sending photo:', error);
            bot.sendMessage(
              chatId,
              'Під час відправлення фото сталася помилка 😳\nСпробуйте знову'
            );
            sendPaymentMessage(chatid, type);
          }
        } else {
          bot.sendMessage(chatId, 'Повідомлення не містить фото підтвердження оплати');
          sendPaymentMessage(chatid, type);
        }
      });
    })
    .catch((error) => {
      console.error('Error sending payment message:', error);
    });
}

function paymentConfirm({ chatId, userId, text, messageId, keyboards }) {
  // Create a new array with the first element replaced
  const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
  updatedKeyboards[1] = [
    {
      text: 'Оплату підтверджено!!!',
      callback_data: 'payment_confirmation',
    },
  ];

  const inlineKeyboard = [...updatedKeyboards];

  bot.editMessageText(text, {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });

  bot.sendMessage(userId, 'Вашу оплату підтверджено✅\nБудь ласка, очікуйте номер відправлення 📦');
}

function sendOrderConfirmation({ chatId, userId, text, messageId, keyboards, orderNumber }) {
  // Create a new array with the first element replaced
  const updatedKeyboards = keyboards.slice(); // Create a copy of the original array
  updatedKeyboards[2] = [
    {
      text: 'Оплату підтверджено!!!',
      callback_data: 'payment_confirmation',
    },
  ];
  const inlineKeyboard = [...updatedKeyboards];

  bot.sendMessage(
    group_chat,
    `Надішліть інформацію про доставку посилки № ${orderNumber}  через SPACE: 1) служба доставки 2) номер посилки`
  );
  bot.once('message', async (msg) => {
    const textFromMsg = msg?.text;
    try {
      const messages = textFromMsg.split(' ');

      bot.sendMessage(
        userId,
        `Ваше замовлення № ${orderNumber} відправлено службою ${messages[0]} ,\n номер відправлення ${messages[1]}📦`
      );

      bot.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
    } catch (err) {
      console.log(err);
    }
  });
}

// Function to handle the /start command
function handleStartCommand(msg) {
  bot.removeAllListeners();

  const chatId = msg.chat.id;
  const user = msg.chat.username;

  // Generate a random number between 1000 and 9999
  const randomPart = Math.floor(Math.random() * 9000) + 1000;

  const option = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Надіслати підтверждення',
            callback_data: JSON.stringify({ confirm: 'confirm', chat_id: chatId }),
          },
        ],
        [
          {
            text: 'Підтвердити оплату',
            callback_data: JSON.stringify({ confirm: 'pay-confirm', chat_id: chatId }),
          },
        ],
        [
          {
            text: 'Вислати номер пачки',
            callback_data: JSON.stringify({ confirm: 'send-pack-number', chat_id: chatId }),
          },
        ],
      ],
    },
  };

  const inlineKeyboard = [
    [
      {
        text: 'Почати знову',
      },
    ],
  ];

  const startMessage =
    'Вас вітає чат-бот Snakicz 🐟\nДля оформления замовлення, будь ласка, поділіться своїм номером телефону 👇🏻\nВи також можете оформити замовлення у нашого менеджера в [телеграм](https://t.me/snakicz_manager) або [інстаграм](https://www.instagram.com/snakicz/)';
  const contactKeyboard = [[{ text: 'Мій телефон', request_contact: true }], ['Вийти']];

  sendKeyboardMessage(chatId, startMessage, contactKeyboard);

  function contactHandler(msg) {
    const chatId = msg.chat.id;
    console.log(msg.contact.phone_number);

    userPhoneNumber = msg.contact.phone_number;
    // Combine chatId and the random number to create the order number
    orderNumber = `${chatId}${randomPart}`;

    const storeKeyboard = [
      [{ text: 'Магазин', web_app: { url: webAppUrl } }],
      [{ text: "Зв'язатись з нами" }],
    ];
    const thankYouMessage =
      "Дякуємо за контакти. Для продовження натисніть 'Магазин' або 'Зв'язатись з нами'.";
    sendKeyboardMessage(chatId, thankYouMessage, storeKeyboard);
  }

  function webDataHandler(msg) {
    if (msg.web_app_data?.data) {
      sendKeyboardMessage(chatId, 'Дані відправлено', inlineKeyboard);

      try {
        const dataFromResponse = JSON.parse(msg.web_app_data.data);
        const { data, products, totalPrice, totalWeight, freeDelivery, isCatExist } =
          dataFromResponse;

        // Functions to format messages
        function formatProduct(count, title, weight) {
          return `назва: ${title} вага: ${weight} кількість: ${count},\n`;
        }

        async function sendProducts() {
          const prodMessage = `
        Ім'я та Прізвище: ${data?.userName} ${data?.userLastName}
        Адреса-Пачкомату: ${data?.addressPack || 'нема'},
        Адреса-покупця: ${data?.userAddress || 'нема'},
        Нік: @${user},
        Є котик: ${isCatExist ? 'Є котик' : 'Нема котика'} 
        Номер замовлення: ${orderNumber}
        Безкоштовна доставка: ${freeDelivery ? 'Є безкоштовна доставка' : 'Нема'}
        Cума замовлення: ${totalPrice},
        Номер телефону для відправки: ${data?.phoneNumber},
        Номер телефону для контакту: ${userPhoneNumber}
        Емейл: ${data?.email},
        Вага замовлення: ${totalWeight},
        Позиції: \n\n${products
          .map((item) => formatProduct(item.count, item.title, item.weight))
          .join('\n\n')}`;

          await bot.sendMessage(group_chat, prodMessage, option);
        }

        async function sendMessages() {
          const messagesToSend = [
            "Дякую за зворотній зв'язок",
            `Ваша вулиця: ${data?.userAddress || data?.addressPack}`,
            `Cума замовлення: ${totalPrice} zł`,
            `Вага замовлення: ${totalWeight} грам`,
          ];

          for (const message of messagesToSend) {
            await bot.sendMessage(chatId, message);
          }

          setTimeout(async () => {
            await bot.sendMessage(
              chatId,
              'Дякуємо за замовлення ❤️\nБудь ласка, очікуйте підтвердження і реквізити на оплату\nЯкщо у вас виникли питання - Ви можете звернутись до нашого менеджера у телеграм (лінк) або інстаграм (лінк)'
            );
          }, 2000);
        }

        sendMessages();
        sendProducts();
        console.log(data);
      } catch (e) {
        console.error('Error parsing data:', e);
      }
    }
  }

  function messageHandlerFromText(msg) {
    if (msg.text === 'Почати знову' || msg.text === 'Вийти') {
      handleStartCommand(msg);
    }
    if (msg.text === "Зв'язатись з нами") {
      bot.sendMessage(msg.chat.id, 'https://t.me/snakicz_manager');
    }
  }

  bot.once('contact', contactHandler);

  bot.once('web_app_data', webDataHandler);

  bot.on('message', messageHandlerFromText);

  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = JSON.parse(callbackQuery.data);
    const text = callbackQuery.message.text;
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const keyboards = callbackQuery.message.reply_markup.inline_keyboard;
    const userId = action?.chat_id;
    let orderNumberFromText;
    const orderNumberMatch = text.match(/Номер замовлення:\s+(\d+)/);

    if (orderNumberMatch && orderNumberMatch[1]) {
      // Extracted order number
      orderNumberFromText = orderNumberMatch[1];
      console.log(`Order Number: ${orderNumberFromText}`);
    } else {
      console.log('Order number not found in the text.');
    }

    switch (action.confirm) {
      case 'confirm':
        confrimOrder({ text, chatId, userId, messageId, keyboards });
        break;
      case 'privat':
        sendPaymentMessage(chatId, action.confirm);
        break;
      case 'polish_bank':
        sendPaymentMessage(chatId, action.confirm);
        break;
      case 'blik':
        sendPaymentMessage(chatId, action.confirm);
        break;
      case 'pay-confirm':
        paymentConfirm({ text, chatId, userId, messageId, keyboards });
        break;
      case 'send-pack-number':
        sendOrderConfirmation({
          text,
          chatId,
          userId,
          messageId,
          keyboards,
          orderNumber: orderNumberFromText,
        });
        break;
    }
  });
}

// Command handlers
bot.onText(/\/echo (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/start/, (msg) => {
  handleStartCommand(msg);
});

bot.onText(/\/restart/, (msg) => {
  handleStartCommand(msg);
});

// Start the Express server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
