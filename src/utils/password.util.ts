import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hash a plain-text password using bcrypt.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a candidate password against a bcrypt hash.
 * Returns true if they match.
 */
export const comparePassword = async (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};
