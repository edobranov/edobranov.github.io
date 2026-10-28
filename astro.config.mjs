// @ts-check
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  site: "https://goranadance.com",
  // Emit horoteka.html, orenda.html, ... so links to the old site's pages keep working.
  build: { format: "file" },
  trailingSlash: "never",
  // The members page reads these at build time. They come from GitHub repository secrets (or a
  // local .env file); the build then encrypts members.html with MEMBERS_PASSWORD.
  env: {
    schema: {
      MEMBERS_PASSWORD: envField.string({ context: "server", access: "secret", optional: true }),
      MEMBERS_CALENDAR: envField.string({ context: "server", access: "secret", optional: true }),
      MEMBERS_LINKS: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
