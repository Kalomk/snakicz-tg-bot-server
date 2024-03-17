import { Request, Response } from 'express';

export type ControllerFunctionType = (req: Request, res: Response) => Promise<any>;
