const ink = "#0a2118";
const lime = "#d7ff45";
// Desaturated lime for dark mode: the full-saturation brand lime is used on
// large fills (buttons, badges, hero banners) and reads as glaring neon on
// dark surfaces. Dark-mode guidance is to desaturate accents.
const limeSoft = "#c9e265";

export default {
  light: {
    primary: ink,
    background: "#f2f5f1",
    card: "#ffffff",
    surfaceSoft: "#e9efe9",
    text: "#10251c",
    notification: "#617069",
    border: "rgba(10,33,24,0.09)",
    tint: ink,
    accent: lime,
    accentText: ink,
    tabIconDefault: "#748078",
    tabIconSelected: ink,
  },
  // Dark surfaces are lifted off near-black and the text is softened off
  // near-white: ~18:1 contrast on true black causes halation/eye strain; the
  // comfortable range is ~11-14:1.
  dark: {
    primary: "#151d17",
    background: "#111813",
    card: "#1a231c",
    surfaceSoft: "#242e26",
    text: "#e7ece7",
    border: "rgba(201,226,101,0.12)",
    notification: "#a0aaa1",
    tint: limeSoft,
    accent: limeSoft,
    accentText: ink,
    tabIconDefault: "#8d998f",
    tabIconSelected: limeSoft,
  },
};
