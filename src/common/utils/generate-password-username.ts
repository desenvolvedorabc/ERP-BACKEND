export function generatePasswordAndUsername() {
  const password = Math.random().toString(36);

  const codeUsername = Math.random().toString(36);

  const username = `erp-user.${codeUsername}`;

  return {
    password,
    username,
  };
}
