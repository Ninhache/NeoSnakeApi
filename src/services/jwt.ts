import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Signs a JWT token.
 * @param payload payload data
 * @param expiration optional expiresIn
 * @returns JWT token as a string
 */
async function sign(payload: object, expiration?: string): Promise<string> {
  const token = await jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiration,
  });
  return token;
}

/**
 * Verifies a token's integrity by a secret key.
 * @param token token to verify
 * @returns Promise resolving to the decoded token if valid, otherwise throws an error
 */
async function verify(token: string): Promise<object | string> {
  try {
    return await jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Token verification failed");
  }
}

export { sign, verify };
