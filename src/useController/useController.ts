import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import { removeExtension } from '../utils';
import multer from 'multer';

const upload = multer();

export function useControllers(app: express.Application) {
  const controllers = fs.readdirSync(path.join(__dirname, 'controllers')).filter((controller) => {
    return !controller.endsWith('.map') && controller !== 'controller.js'; // Filter out files ending with '.map' and 'controller.js'
  });

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
        app.use(
          `/${controlleName}/${func}`,
          upload.single('file'),
          controllerModule[moduleObj][func]
        );
        app.use();
      });
    });
  });
}
