/**
 * Génère les initiales depuis un email
 * @param {string} email - L'email (ex: "jean.dupont@gmail.com")
 * @returns {string} Les initiales (ex: "JD")
 */
export function getInitialsFromEmail(email) {
  if (!email) return "?";

  const localPart = email.split("@")[0];
  const parts = localPart.split(/[._-]/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return localPart.substring(0, 2).toUpperCase();
}
