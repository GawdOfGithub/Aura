export const normalizeFileUri = (path: string) => {
  if (!path) return "";

  if (path.startsWith("file://")) {
    return path.replace("file://file://", "file://");
  }

  if (path.startsWith("/")) {
    return `file://${path}`;
  }

  return `file://${path}`;
};
