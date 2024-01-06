"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useControllers = exports.removeExtension = exports.UT_sendKeyboardMessage = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Helper function to send a message with a keyboard
function UT_sendKeyboardMessage(bot, chatId, text, keyboard) {
    const options = {
        parse_mode: 'Markdown',
        reply_markup: {
            one_time_keyboard: true,
            keyboard,
        },
    };
    bot.sendMessage(chatId, text, options);
}
exports.UT_sendKeyboardMessage = UT_sendKeyboardMessage;
function removeExtension(filename) {
    return filename.replace(/\.[^/.]+$/, '');
}
exports.removeExtension = removeExtension;
function useControllers(app) {
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
exports.useControllers = useControllers;
//# sourceMappingURL=utils.js.map