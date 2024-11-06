export function parseMessageContent(content: string | null) {
  const lines = content?.split("\n");
  const data: Record<string, string> = {};

  lines?.forEach((line) => {
    // Supprime les espaces au début et à la fin de la ligne
    line = line.trim();

    // Vérifie si la ligne contient une paire clé-valeur avec ":"
    const keyValueMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (keyValueMatch) {
      let key = keyValueMatch[1].trim();
      let value = keyValueMatch[2].trim();

      // Supprime les emojis ou caractères spéciaux du début de la clé
      key = key.replace(/^[^\wÀ-ÿ]+/g, "").trim();

      // Ajoute la paire clé-valeur à l'objet data
      data[key] = value;
    }
  });

  return data;
}
