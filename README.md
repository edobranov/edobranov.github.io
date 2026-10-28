# goranadance.com

The GORANA DANCE website, built with [Astro](https://astro.build) and published to GitHub Pages.

All text, dates and photo lists live in `src/content/`. Most updates are an edit to one of those files; the layout code rarely needs to change.

## Common edits

| To change…                                | Edit                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| The next horoteka date, time or RSVP link | `src/content/horoteka.yaml` (the `next:` block)                                           |
| About text, members, the leader's bio     | `src/content/groups/gorana.yaml` or `algara.yaml`                                         |
| Gallery photos                            | add the image to `src/assets/images/gallery/`, then list it in `src/content/gallery.yaml` |
| Trailer videos                            | `src/content/videos.yaml` (YouTube video IDs)                                             |
| Menu, contact links, footer text          | `src/content/site.yaml`                                                                   |

### Adding a concert

Create `src/content/concerts/<name>.md`. The file name becomes the page address (`/<name>`). Copy an existing concert file as a starting point: the front matter (between the `---` lines) holds the date, venue, lineup and credits, and the text below it is the introduction.

The concert with the latest `date` is featured at the top of Past Concerts. Set `poster: true` if its image has text on it, so it is never cropped.

### Photos

Put images in `src/assets/images/` and refer to them with a path relative to the content file, as the existing files do. The build resizes them and converts them to modern formats, so originals can be large.

## Members page

`/members` is a password-protected page for group members, left out of the menu and search engines. The build encrypts it with [StatiCrypt](https://github.com/robinmoisson/staticrypt), so visitors see a password screen and the page unlocks in their browser. "Remember me" keeps it unlocked on that device until the password changes or they select "Lock this page on this device".

Its contents come from three **repository secrets** (Settings → Secrets and variables → Actions → New repository secret), never from this public repository:

| Secret             | Value                                                                                                                                                                                           |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MEMBERS_PASSWORD` | The shared password. Anyone can download the locked page and try passwords offline, so length is its only protection.                                                                           |
| `MEMBERS_CALENDAR` | The Google Calendar's ID, public URL or embed code (all in the calendar's settings under "Integrate calendar"). The calendar must be public ("Make available to public") for the embed to show. |
| `MEMBERS_LINKS`    | One link per line, written as `Label \| https://...` (e.g. `Songs \| https://drive.google.com/...`).                                                                                            |

After changing a secret, re-run the deploy: Actions → Deploy to GitHub Pages → Run workflow. Changing the password locks the page on every device. Secrets can't be viewed once saved, so keep a private copy of the links list for editing.

The calendar and Drive links work for anyone who has them; the password keeps them from being found, so don't store anything sensitive behind it.

To try the page on your computer, see [Testing /members](#testing-members) below.

## Working on the site

Requires Node.js 22.23.4 or newer (the deploy workflow uses Node 24).

```bash
npm install      # once, and again after package.json changes
npm run dev      # live preview while you edit
npm run build    # production build into dist/
npm run preview  # serves the last build from dist/
```

- `npm run dev` builds each page as you open it and reloads the browser whenever you save a file. Use it while editing.
- `npm run build` produces the finished site in `dist/`, exactly as the deploy workflow does, then exits.
- `npm run preview` only serves what's already in `dist/`. After an edit, run `npm run build` again and reload the page; there's no need to restart preview.

Both print the address to open, usually http://localhost:4321.

If a content file has a typo or points at a missing image, the build stops and names the file and field.

### Testing /members

Put the three secrets in a `.env` file at the top of the repository (git ignores it), with `\n` between links:

```
MEMBERS_PASSWORD="..."
MEMBERS_CALENDAR="..."
MEMBERS_LINKS="Songs | https://...\nRecordings | https://..."
```

- **Editing the page:** `npm run dev` shows its contents with no password screen, because the page is only encrypted by `npm run build`.
- **Seeing what members see:** run `npm run build`, then `npm run preview`, and open `/members`. This is the password screen and unlocked page exactly as they'll be published.
- **Getting the password screen back:** "Remember me" works locally too. Select "Lock this page on this device" at the bottom of the page, or open `/members?staticrypt_logout`.
- **Without `MEMBERS_PASSWORD`,** the page only says it isn't set up yet, in every mode.

The build warns if the password is short, and stops with an error if the page didn't come out encrypted, so a readable `/members` is never published.

## Publishing

Every push to `main` builds the site and deploys it via `.github/workflows/deploy.yml`. In the repository's **Settings → Pages**, **Source** must be set to **GitHub Actions**. The custom domain comes from `public/CNAME`.
