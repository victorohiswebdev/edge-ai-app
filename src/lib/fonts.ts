import localFont from "next/font/local";

export const poppins = localFont({
  src: [
    {
      path: "../../public/fonts/poppins/poppins-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/poppins/poppins-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/poppins/poppins-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/poppins/poppins-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-poppins",
});

export const spaceGrotesk = localFont({
  src: [
    {
      path: "../../public/fonts/space-grotesk/space-grotesk-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-space-grotesk",
});
