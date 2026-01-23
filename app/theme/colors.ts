export const colors = {
  font: {
    0: "#ffffff",
  },
  primary: {
    //shades of primary color
    50: "#FF3320",
  },
  neutral: {
    90: "#000000",
    30: "#E8E4BB",
    0: "#FFFFFF",
  },
  success: {
    // shades of green (live,success etc)
    0: "#1EE62A29",
    50: "#0CB818",
    90: "#26C72F",
  },

  error: { 50: "#FF3320" },
} as const;

export type Theme = typeof colors;
