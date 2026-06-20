import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // cool limestone "fog" + cool near-black "asphalt" + restrained oxblood
        fog: "#E8E9E4",
        bone: "#F2F3EF",
        paper: "#FBFBF8",
        asphalt: "#14161A",
        graphite: "#5E6367",
        slate: "#8A8F92",
        line: "#CBCCC4",
        "line-dark": "#2A2E33",
        oxblood: "#7C2433",
        "oxblood-bright": "#9A2C3E",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        eyebrow: "0.22em",
        tightish: "-0.01em",
        tighter2: "-0.03em",
      },
      maxWidth: {
        prose2: "62ch",
        shell: "1380px",
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 8vw, 7.5rem)", { lineHeight: "0.92" }],
        "display-lg": ["clamp(2.4rem, 5.5vw, 5rem)", { lineHeight: "0.95" }],
        "display-md": ["clamp(1.8rem, 3.5vw, 3rem)", { lineHeight: "1.0" }],
      },
      transitionTimingFunction: {
        instrument: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
