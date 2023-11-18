"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EH_contactHandler = exports.EH_webDataHandler = void 0;
const __1 = require("..");
const utils_1 = require("./utils");
const controller_1 = require("./controllers/controller");
const __2 = require("..");
async function EH_webDataHandler(msg) {
    if (msg.web_app_data?.data) {
        const chatId = msg.chat.id;
        const userName = msg.chat.username;
        // Find the user by chatId
        const user = await __1.prisma.user.findUnique({
            where: { chatId: chatId },
        });
        if (user) {
            const userOrderCount = user?.ordersCount;
            const userPhoneNumber = user?.phoneNumber;
            const orderNumber = chatId + Math.floor(Math.random() * 9000) + 1000;
            const isFirstTimeBuy = user.isFirstTimeBuy;
            const inlineKeyboard = [
                [
                    {
                        text: 'Почати знову',
                    },
                ],
            ];
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
                        [
                            {
                                text: 'Актуалізувати користувача',
                                callback_data: JSON.stringify({ confirm: 'actualize', chat_id: chatId }),
                            },
                        ],
                    ],
                },
            };
            (0, utils_1.UT_sendKeyboardMessage)(__2.bot, chatId, 'Замовлення відправлено', inlineKeyboard);
            try {
                const dataFromResponse = JSON.parse(msg.web_app_data.data);
                const { data, products, totalPrice, totalWeight, freeDelivery, isCatExist, activePrice, rightShipPrice, rightCurrentCountry, idFromWeb, queryId, user } = dataFromResponse;
                const calcTotalPrice = +totalPrice + Number(rightShipPrice);
                // Functions to format messages
                function formatProduct(count, title, weight) {
                    return `назва: ${title} вага: ${weight} кількість: ${count},\n`;
                }
                const userNameAndLastName = `${data?.userName} ${data?.userLastName}`;
                const addressPack = data?.addressPack || 'нема';
                const firstTimeBuyText = isFirstTimeBuy ? 'так' : 'ні';
                const userOrderCountText = !isFirstTimeBuy
                    ? `Кількість замовлень за весь час: ${userOrderCount}`
                    : null;
                const userAddress = data?.userAddress || 'нема';
                const country = rightCurrentCountry;
                const userCity = data?.userCity;
                const userIndexCity = data?.userIndexCity;
                const userNickname = `@${userName}`;
                const catStatus = isCatExist ? 'Є котик' : 'Нема котика';
                const orderNumberText = orderNumber;
                const freeDeliveryStatus = freeDelivery ? 'Є безкоштовна доставка' : 'Нема';
                const totalPriceText = `${calcTotalPrice} ${activePrice}`;
                const phoneForShipping = data?.phoneNumber;
                const contactPhoneNumber = userPhoneNumber;
                const email = data?.email;
                const orderWeight = totalWeight;
                const productsList = products
                    .map((item) => formatProduct(item.count, item.title, item.weight))
                    .join('\n\n');
                async function sendProducts() {
                    const prodMessage = `
  Ім'я та Прізвище: ${userNameAndLastName}
  Адреса-Пачкомату: ${addressPack},
  Купує вперше: ${firstTimeBuyText},
  ${userOrderCountText}
  Адреса-покупця: ${userAddress},
  Країна: ${country}
  Місто: ${userCity},
  Індекс: ${userIndexCity}
  Нік: ${userNickname},
  Є котик: ${catStatus}
  Номер замовлення: ${orderNumberText}
  Безкоштовна доставка: ${freeDeliveryStatus}
  Cума замовлення: ${totalPriceText}
  Номер телефону для відправки: ${phoneForShipping}
  Номер телефону для контакту: ${contactPhoneNumber}
  Емейл: ${email}
  Вага замовлення: ${orderWeight}
  Позиції: \n\n${productsList}`;
                    await __2.bot.sendMessage(__1.group_chat, prodMessage, option);
                }
                async function sendMessages() {
                    const messagesToSend = [
                        `Ваша адреса: ${userAddress || addressPack}`,
                        `Cума замовлення: ${calcTotalPrice} ${activePrice}`,
                        `Вага замовлення: ${totalWeight} грам`,
                        `Номер замовлення: ${orderNumber}`,
                    ];
                    for (const message of messagesToSend) {
                        await __2.bot.sendMessage(chatId, message);
                    }
                    setTimeout(async () => {
                        await __2.bot.sendMessage(chatId, 'Дякуємо за замовлення ❤️\nБудь ласка, очікуйте підтвердження і реквізити на оплату\nЯкщо у вас виникли питання - Ви можете звернутись до нашого менеджера у телеграм (https://t.me/snakicz_manager) або (https://www.instagram.com/snakicz/)');
                    }, 2000);
                }
                (0, controller_1.createOrder)({
                    chatId: chatId,
                    orderData: {
                        orderNumber: JSON.stringify(orderNumber),
                        contactPhoneNumber: userPhoneNumber,
                        phoneNumber: data?.phoneNumber,
                        userNickname,
                        userAddress,
                        userCity,
                        userIndexCity,
                        userLastName: data?.userLastName,
                        userName: data?.userName,
                        isCatExist,
                        addressPack,
                        freeDelivery,
                        activePrice,
                        totalPrice,
                        email,
                        totalWeight,
                        orderItems: JSON.stringify(products),
                    },
                });
                sendMessages();
                sendProducts();
                // Update the user's values
                await __1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        ordersCount: user.ordersCount + 1,
                        isFirstTimeBuy: false, // Set isFirstTimeBuy to false
                    },
                });
            }
            catch (e) {
                console.error('Error parsing data:', e);
            }
        }
    }
}
exports.EH_webDataHandler = EH_webDataHandler;
async function EH_contactHandler(msg) {
    const chatId = msg.chat.id;
    // Generate a random number between 1000 and 9999
    const phoneNumber = msg?.contact?.phone_number;
    await (0, controller_1.createOrFindExistUser)({ chatId: chatId, phoneNumber }).then((user) => {
        const isFirstTimeBuy = user?.isFirstTimeBuy;
        const url = isFirstTimeBuy ? __1.webAppUrl + '/priceSelect' : __1.webAppUrl;
        const storeKeyboard = [[{ text: 'Магазин', web_app: { url } }]];
        const thankYouMessage = "Дякуємо за контакти. Для продовження натисніть 'Магазин'";
        (0, utils_1.UT_sendKeyboardMessage)(__2.bot, chatId, thankYouMessage, storeKeyboard);
    });
}
exports.EH_contactHandler = EH_contactHandler;
//# sourceMappingURL=eventHandlers.js.map