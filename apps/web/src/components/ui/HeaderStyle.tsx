import { cva } from "class-variance-authority";

export const headerStyles = cva("text-center font-semibold", {
  variants: {
    type: {
      1: "text-4xl",
      2: "text-3xl",
      3: "text-2xl",
      4: "text-xl",
    },
  },
  defaultVariants: {
    type: 3,
  },
});
