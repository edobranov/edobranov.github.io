// Runs after `astro build`: encrypts dist/members.html in place with the shared members password,
// using StatiCrypt. Visitors then see a password screen and the page is decrypted in their browser.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";

const FILE = "dist/members.html";
// Not secret. Kept fixed so "Remember me" keeps working across rebuilds until the password changes.
const SALT = "69755360430139d38c4930d00df0d718";

const password = process.env.MEMBERS_PASSWORD;
if (!existsSync(FILE)) process.exit(0);
if (!password) {
  // members.astro leaves out the calendar and links when there's no password, so nothing private
  // is published; the page just says it isn't set up.
  console.warn("[members] MEMBERS_PASSWORD is not set, so /members only shows a 'not set up' notice.");
  process.exit(0);
}
if (password.length < 14) {
  // Anyone can download the encrypted page and try passwords offline, without limit.
  console.warn("[members] MEMBERS_PASSWORD is short and could be guessed offline. Prefer 4 random words.");
}

execFileSync(
  "npx",
  [
    "staticrypt", FILE,
    "--directory", "dist",
    "--config", "false",
    "--salt", SALT,
    "--short", // the length warning above replaces StatiCrypt's interactive prompt, which nobody can answer in CI
    "--remember", "0", // remembered until the password changes or the visitor locks the page
    "--template", "scripts/members-password.html",
    "--template-title", "Member Resources",
    "--template-instructions", "This page is for GORANA DANCE members. Enter the members password to continue.",
    "--template-placeholder", "Password",
    "--template-button", "Open",
    "--template-remember", "Remember me on this device",
    "--template-error", "That password didn't work. Please try again.",
  ],
  // StatiCrypt reads the password from this variable, so it never appears in the command line.
  { stdio: ["ignore", "inherit", "inherit"], env: { ...process.env, STATICRYPT_PASSWORD: password } },
);

// StatiCrypt can quit without encrypting and still report success. Never let the readable page ship.
if (!readFileSync(FILE, "utf8").includes('id="staticrypt-form"')) {
  rmSync(FILE);
  console.error("[members] Encryption failed, so the build stopped before /members could be published.");
  process.exit(1);
}
console.log("[members] Encrypted /members.");
