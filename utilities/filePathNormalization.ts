
/**
 * Normalizes an image path to ensure it always starts with "file://"
 * and removes accidental double prefixes.
 * * @param {string} path - The raw path from Vision Camera or Image Picker
 * @returns {string} - A clean URI safe for ML Kit libraries
 */
export const normalizeFileUri = (path:string) => {
  if (!path) return '';

  // 1. If it already starts with 'file://', checks for the double prefix bug
  if (path.startsWith('file://')) {
    // Fix the "file://file://" bug if it exists
    return path.replace('file://file://', 'file://');
  }

  // 2. Android typically returns a raw path like "/data/user/..."
  //    We must prepend 'file://' for most native modules to read it.
  if (path.startsWith('/')) {
    return `file://${path}`;
  }

  // 3. Fallback: If it's a weird path (like 'content://' or just a filename), return as is
  //    or prepend file:// if you are sure it's a local file.
  return `file://${path}`;
};