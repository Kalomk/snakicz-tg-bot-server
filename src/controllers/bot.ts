import { ControllerFunctionType } from '../../type';
import { webDataHandler } from '../bot/webDataHandler';
import {
  SM_confrimOrder,
  SM_paymentConfirm,
  SM_actualizeInfo,
  SM_sendOrderConfirmation,
} from '../bot/sendingMesagesFuncs';

const confirmOrder: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId } = req.body;
    SM_confrimOrder({ chatId: uniqueId });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error sending confirmation message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const paymentConfirm: ControllerFunctionType = async (req, res) => {
  try {
    const Id: string = req.body.uniqueId;
    SM_paymentConfirm(Id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error sending payment confirmation message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const actualizeInfo: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId, orderNumber } = req.body;
    SM_actualizeInfo(uniqueId, orderNumber);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error sending actualization message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const sendOrderConfirmation: ControllerFunctionType = async (req, res) => {
  try {
    const { uniqueId, orderNumber, messages } = req.body;
    SM_sendOrderConfirmation({ userId: uniqueId, orderNumber, messages });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error sending order confirmation message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const Bot = {
  confirmOrder,
  sendOrderConfirmation,
  actualizeInfo,
  paymentConfirm,
};
