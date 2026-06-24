import User, { IUser } from '../models/user.model';
import { generateToken } from '../utils/jwt.util';
import { ApiError } from '../utils/api-error';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: 'admin' | 'staff';
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

/**
 * Service: Register a new user.
 * Checks for duplicate email, creates user, and returns JWT.
 */
export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  const { name, email, password, phoneNumber, role } = input;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.badRequest('A user with this email already exists');
  }

  // Create user (password is hashed by the User model pre-save hook)
  const user: IUser = await User.create({
    name,
    email,
    password,
    phoneNumber,
    role: role || 'staff', // Default to 'staff' for auth module
  });

  // Generate JWT
  const token = generateToken({ id: user._id.toString(), role: user.role });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

/**
 * Service: Authenticate user with email and password.
 * Returns JWT on success.
 */
export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  // Find user and explicitly select password (excluded by default via select: false)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Contact an administrator.');
  }

  // Generate JWT
  const token = generateToken({ id: user._id.toString(), role: user.role });

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};
