// Shapes of every content file under src/content. A typo or a missing image in a content file
// fails the build with a message pointing at the file and field.
import { defineCollection, type SchemaContext } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Kinds of contact/social link; each has a matching icon in components/Icon.astro.
const linkKind = z.enum(["facebook", "instagram", "tiktok", "email", "donate"]);

const photo = ({ image }: SchemaContext) =>
  z.object({
    src: image(),
    alt: z.string(),
    // CSS object-position for photos that get cropped, e.g. "50% 30%" keeps faces in frame.
    focus: z.string().optional(),
  });

// Ensembles with an About page (GORANA DANCE, Algara).
const groups = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/groups" }),
  schema: (ctx) =>
    z.object({
      name: z.string(),
      tagline: z.string(),
      photo: photo(ctx),
      about: z.array(z.string()),
      // Shown as buttons after the About text, introduced by the optional socialIntro sentence.
      socialIntro: z.string().optional(),
      social: z.array(z.object({ kind: linkKind, label: z.string(), href: z.url() })).default([]),
      // A highlighted link that closes the About section.
      callout: z.object({ text: z.string(), href: z.string() }).optional(),
      leader: z.object({
        name: z.string(),
        role: z.string(),
        photo: photo(ctx),
        bio: z.array(z.string()),
      }),
      // "Name" or "Name (Role)"; the role is shown as a tag.
      members: z.array(z.string()),
    }),
});

// One Markdown file per concert. Front matter holds the facts, lineup and credits; the body is
// the introduction shown under "About the concert". Newest concert (by date) is featured.
const concerts = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/concerts" }),
  schema: (ctx) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      kicker: z.string().optional(),
      date: z.coerce.date(),
      time: z.string().optional(),
      venue: z.string(),
      address: z.string().optional(),
      map: z.url().optional(),
      image: photo(ctx),
      // The image has text baked in (a poster): always shown whole, never cropped.
      poster: z.boolean().default(false),
      summary: z.string(),
      poem: z.array(z.string()).default([]),
      guests: z
        .array(
          z.object({
            name: z.string(),
            about: z.string(), // Markdown
            photos: z.array(photo(ctx)).default([]),
          }),
        )
        .default([]),
      lineup: z.array(
        z.object({
          title: z.string(),
          performer: z.string().optional(),
          description: z.string().optional(), // inline Markdown
          // "Label: Value" lines, e.g. "Choreography: Elissaveta Iordanova".
          credits: z.array(z.string()).default([]),
          note: z.string().optional(), // inline Markdown, shown highlighted
          photo: photo(ctx).optional(),
        }),
      ),
      credits: z.array(
        z.object({
          title: z.string(),
          note: z.string().optional(), // e.g. a thank-you under the group's names
          people: z.array(z.string()),
        }),
      ),
    }),
});

const horoteka = defineCollection({
  loader: glob({ pattern: "horoteka.yaml", base: "./src/content" }),
  schema: (ctx) =>
    z.object({
      title: z.string(),
      eyebrow: z.string(),
      intro: z.string(),
      photo: photo(ctx),
      next: z.object({
        date: z.coerce.date(),
        time: z.string(),
        rsvp: z.url().optional(),
      }),
      price: z.string(),
      venue: z.string(),
      address: z.string(),
      map: z.url(),
      bring: z.array(z.object({ icon: z.enum(["cash", "shoes", "snacks"]), text: z.string() })),
    }),
});

const gallery = defineCollection({
  loader: glob({ pattern: "gallery.yaml", base: "./src/content" }),
  schema: (ctx) => z.object({ photos: z.array(photo(ctx)) }),
});

const video = z.object({ id: z.string(), title: z.string() });
const videos = defineCollection({
  loader: glob({ pattern: "videos.yaml", base: "./src/content" }),
  schema: z.object({ trailers: z.array(video) }),
});

const site = defineCollection({
  loader: glob({ pattern: "site.yaml", base: "./src/content" }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    footer: z.string(),
    nav: z.array(
      z.object({
        label: z.string(),
        href: z.string().optional(),
        children: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
      }),
    ),
    contact: z.array(
      z.object({ kind: linkKind, label: z.string(), href: z.string() }),
    ),
  }),
});

export const collections = { groups, concerts, horoteka, gallery, videos, site };
