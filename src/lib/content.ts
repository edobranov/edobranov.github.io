import { getCollection, getEntry } from "astro:content";

// Single-file collections: each holds one entry named after its file.
export const getSite = async () => (await getEntry("site", "site"))!.data;
export const getHoroteka = async () => (await getEntry("horoteka", "horoteka"))!.data;
export const getGallery = async () => (await getEntry("gallery", "gallery"))!.data.photos;
export const getVideos = async () => (await getEntry("videos", "videos"))!.data;
export const getGroup = async (id: "gorana" | "algara") => (await getEntry("groups", id))!.data;

/** Concerts, newest first. */
export const getConcerts = async () =>
  (await getCollection("concerts")).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const concertHref = (id: string) => `/${id}`;
