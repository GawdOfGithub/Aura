export const getFirstName = (name: string): string => {
  //  Returns first name of user
  return name.trim().split(/\s+/)[0] || "";
};
