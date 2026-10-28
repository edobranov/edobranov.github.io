import { marked } from "marked";

// Content dates are calendar days (YAML "2026-11-13" parses as UTC midnight), so format in UTC
// to avoid showing the previous day in American time zones.
const fmt = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options }).format(date);

/** "Saturday, October 3, 2026" */
export const longDate = (date: Date) =>
  fmt(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

/** Pieces for the red date stub: { month: "Oct", day: "3", year: "2026" } */
export const dateParts = (date: Date) => ({
  month: fmt(date, { month: "short" }),
  day: fmt(date, { day: "numeric" }),
  year: fmt(date, { year: "numeric" }),
});

export const year = (date: Date) => fmt(date, { year: "numeric" });

/** "Galina Saharova (Choreographer)" -> { name: "Galina Saharova", role: "Choreographer" } */
export const splitRole = (s: string) => {
  const m = /^(.*?)\s*\((.+)\)\s*$/.exec(s);
  return m ? { name: m[1], role: m[2] } : { name: s, role: "" };
};

/** "Choreography: Elissaveta Iordanova" -> { label: "Choreography", value: "Elissaveta Iordanova" } */
export const splitCredit = (s: string) => {
  const i = s.indexOf(": ");
  return i === -1 ? { label: "", value: s } : { label: s.slice(0, i), value: s.slice(i + 2) };
};

// Content is written by the site's maintainers, so its Markdown is trusted.
export const inlineMarkdown = (s: string) => marked.parseInline(s, { async: false });
export const markdown = (s: string) => marked.parse(s, { async: false });

/** Opens links to other sites in a new tab: `<a href={href} {...linkAttrs(href)}>` */
export const linkAttrs = (href: string) => (/^https?:/.test(href) ? { target: "_blank", rel: "noopener" } : {});
