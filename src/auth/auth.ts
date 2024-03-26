import { prisma, secretKey, sex } from '../..';
import { ControllerFunctionType } from 'type';
import jwt, { VerifyErrors } from 'jsonwebtoken';
import express, { NextFunction, Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { createOrFindExistUserService } from '../services/userService';

interface DecodedToken {
  uniqueId: string;
  secretSex: string;
}

const getSensitiveDataByUser: ControllerFunctionType = async (req, res) => {
  // If token verification is successful, return protected data
  try {
    const user = await prisma.user.findUnique({
      where: {
        uniqueId: (req as any).uniqueId.toString(),
      },
    });
    return res.status(200).json(user);
  } catch (e) {
    console.log(e);
  }
};
const getSensitiveDataByAdmin: ControllerFunctionType = async (req, res) => {
  if ((req as any).status !== 'admin') {
    res.status(500).json({ message: 'Not admin!!!' });
  }
  // If token verification is successful, return protected data
  try {
    const user = await prisma.user.findUnique({
      where: {
        uniqueId: (req as any).uniqueId.toString(),
      },
    });
    return res.status(200).json(user);
  } catch (e) {
    console.log(e);
  }
};

const login: ControllerFunctionType = async (req, res) => {
  const { uniqueId, password } = req.body;

  // Find user by username and password (you might use a database query here)
  const user = await prisma.user.findUnique({
    where: {
      uniqueId: uniqueId.toString(),
    },
  });

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const pwMatches = await bcrypt.compare(password, user.password);

  if (!pwMatches) {
    throw new Error('Credential error');
  }

  // Generate JWT token
  const token = jwt.sign({ uniqueId: user.uniqueId }, secretKey, { expiresIn: '1h' });

  res.json({ token });
};

const register: ControllerFunctionType = async (req, res) => {
  const { uniqueId, password, phoneNumber, secretKey } = req.body;

  // Find user by username and password (you might use a database query here)

  const secretSex = sex === secretKey ? 'admin' : 'user';

  const existingUser = await prisma.user.findUnique({
    where: {
      uniqueId: uniqueId.toString(),
    },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }
  const saltAndRound = 10;
  const hash = await bcrypt.hash(password, saltAndRound);

  try {
    const userData = await createOrFindExistUserService({
      uniqueId,
      phoneNumber,
      status: secretSex,
      password: hash,
    });
    const token = jwt.sign({ uniqueId: userData.uniqueId, secretSex }, secretKey, {
      expiresIn: '1h',
    });

    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.log(err);
    throw new Error('Auth error');
  }
};

function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded: any = jwt.verify(token, secretKey);
    if (typeof decoded === 'object' && 'uniqueId' in decoded) {
      const decodedToken = decoded as DecodedToken;
      (req as any).uniqueId = decodedToken.uniqueId;
      (req as any).status = decodedToken.secretSex;

      next();
    } else {
      throw new Error('Invalid token');
    }
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export const useAuth = (app: express.Application) => {
  // Login endpoint
  app.post('/login', login);

  //register endpoint
  app.post('/register', register);

  // Protected route
  app.get('/getMe', verifyToken, getSensitiveDataByUser);
  app.get('/getMeAdmin', verifyToken, getSensitiveDataByAdmin);
};
