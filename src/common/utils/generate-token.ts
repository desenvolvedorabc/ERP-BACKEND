import * as crypto from "node:crypto";

export function generateToken(): { token: string } {
  const token = crypto.randomUUID().substring(0, 6);

  return {
    token,
  };
}
