import { Request, Response } from 'express';
import { asyncHandler } from '../middlewares/async.middleware';
import { registerUser, loginUser } from '../services/auth.service';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phoneNumber, role } = req.body;

  const result = await registerUser({ name, email, password, phoneNumber, role });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

/**
 * @desc    Login user & return JWT
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await loginUser({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});
