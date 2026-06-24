import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  id: string;
  role: string;
}

/**
 * Generate a signed JWT access token.
 */
export const generateToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify and decode a JWT access token.
 * Throws if the token is invalid or expired.
 */
export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
