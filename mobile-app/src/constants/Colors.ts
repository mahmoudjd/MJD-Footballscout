const ink = "#0a0f29";
const lime = "#d7ff45";
// Desaturated lime for dark mode: the full-saturation brand lime is used on
// large fills (buttons, badges, hero banners) and reads as glaring neon on
// dark surfaces. Dark-mode guidance is to desaturate accents.
const limeSoft = "#c9e265";

export default {
  light: {
    primary: ink,
    background: "#f4f6fb",
    card: "#ffffff",
    surfaceSoft: "#e8ecf6",
    text: "#0d1226",
    notification: "#626b85",
    border: "rgba(10,15,41,0.09)",
    tint: ink,
    accent: lime,
    accentText: ink,
    tabIconDefault: "#7a829b",
    tabIconSelected: ink,
  },
  // Dark surfaces are lifted off near-black and the text is softened off
  // near-white: ~18:1 contrast on true black causes halation/eye strain; the
  // comfortable range is ~11-14:1.
  dark: {
    primary: "#11162f",
    background: "#0b0f22",
    card: "#151b36",
    surfaceSoft: "#1f2645",
    text: "#e6e9f4",
    border: "rgba(201,226,101,0.12)",
    notification: "#9ba3bd",
    tint: limeSoft,
    accent: limeSoft,
    accentText: ink,
    tabIconDefault: "#8a93ad",
    tabIconSelected: limeSoft,
  },
};
