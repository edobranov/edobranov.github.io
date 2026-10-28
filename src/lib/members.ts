// Parsing for the members page's secrets. Errors name the line, never its contents, because
// build logs of a public repository are public.

/**
 * Google Calendar embed URLs for a month view (wide screens) and an agenda list (phones).
 * Accepts a calendar ID, the calendar's public or shareable URL, or the whole <iframe> embed code.
 */
export function calendarEmbeds(raw: string) {
  const s = raw.trim();
  const iframeSrc = /src="([^"]+)"/.exec(s)?.[1]?.replaceAll("&amp;", "&");
  const url = iframeSrc ?? (/^https?:\/\//.test(s) ? s : null);

  let ids = [s];
  if (url) {
    const params = new URL(url).searchParams;
    ids = params.getAll("src");
    // Shareable links ("...?cid=...") carry the calendar ID base64-encoded.
    if (!ids.length && params.get("cid")) ids = [atob(params.get("cid")!)];
    if (!ids.length) throw new Error("MEMBERS_CALENDAR is a URL without a calendar ID in it (no src= or cid=).");
  }

  const query = new URLSearchParams();
  ids.forEach((id) => query.append("src", id));
  query.set("ctz", "America/New_York");
  for (const flag of ["showTitle", "showPrint", "showCalendars", "showTz"]) query.set(flag, "0");
  const base = `https://calendar.google.com/calendar/embed?${query}`;
  return { month: `${base}&mode=MONTH`, agenda: `${base}&mode=AGENDA` };
}

/** One link per line: "Label | https://...". A line with only a URL uses the site name as its label. */
export function parseLinks(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line, i) => ({ line, n: i + 1 }))
    .filter(({ line }) => line && !line.startsWith("#"))
    .map(({ line, n }) => {
      const parts = line.split("|").map((p) => p.trim());
      const href = parts.length > 1 ? parts.slice(1).join("|") : parts[0];
      let url: URL;
      try {
        url = new URL(href);
      } catch {
        throw new Error(`MEMBERS_LINKS line ${n} isn't in the form "Label | https://...".`);
      }
      const host = url.hostname.replace(/^www\./, "");
      return {
        label: parts.length > 1 ? parts[0] : host,
        href: url.href,
        host,
        isDrive: /(^|\.)(drive|docs)\.google\.com$/.test(url.hostname),
      };
    });
}
