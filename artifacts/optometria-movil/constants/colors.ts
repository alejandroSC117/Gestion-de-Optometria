/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#102A43',
    tint: '#1769AA',

    // Core surfaces
    background: '#F5F9FD',
    foreground: '#102A43',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#102A43',

    // Primary action color (buttons, links, active states)
    primary: '#1769AA',
    primaryForeground: '#FFFFFF',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E6F1FB',
    secondaryForeground: '#1F527D',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EFF5FA',
    mutedForeground: '#6B8296',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#D9EDFF',
    accentForeground: '#1769AA',

    // Destructive actions (delete, error states)
    destructive: '#B94C4C',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#D9E6F0',
    input: '#D9E6F0',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
