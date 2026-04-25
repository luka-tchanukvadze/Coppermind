// Tells TypeScript that side-effect CSS imports like `import "./globals.css"`
// are valid. Next.js handles these at build time but TS doesn't ship
// declarations for them by default.
declare module "*.css";
