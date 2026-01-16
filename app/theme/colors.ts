export const colors = {
  primary: {
    50: "#FF3320",
  },
  neutral: {
    90: "#000000",
    30: "#E8E4BB",
    0: "#FFFFFF",
  },
  success: {
    50: "#0CB818",
  },

  error: { 50: "#FF3320" },
} as const;

export type Theme = typeof colors;
