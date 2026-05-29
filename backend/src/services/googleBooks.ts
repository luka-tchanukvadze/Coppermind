import type { BookSearchResult } from "./types.js";

// google returns multiple cover sizes when available. order matters: pickBestCover walks
// it largest-first and takes the first one present. thumbnail is the universal fallback.
export type GoogleImageLinks = {
  extraLarge?: string;
  large?: string;
  medium?: string;
  small?: string;
  thumbnail?: string;
  smallThumbnail?: string;
};

type GoogleBookItem = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    categories?: string[];
    imageLinks?: GoogleImageLinks;
  };
};

type GoogleBooksResponse = {
  items?: GoogleBookItem[];
};

// largest available cover, https-ified. mixed-content errors if we leave it as http
export function pickBestGoogleCover(links: GoogleImageLinks | undefined): string {
  if (!links) return "";
  const url =
    links.extraLarge ||
    links.large ||
    links.medium ||
    links.small ||
    links.thumbnail ||
    links.smallThumbnail ||
    "";
  return url.replace(/^http:\/\//, "https://");
}

// google books search. Throws on any failure -> controller falls back to OL
export async function searchGoogleBooks(
  q: string,
): Promise<BookSearchResult[]> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

  // retry 5xx (google api issue). 4xx = my bug, bail
  let response: globalThis.Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(url);
    if (response.ok || response.status < 500) break;
    if (attempt < 2)
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }

  // loop runs at least once but TS doesn't know that, so i need guard
  if (!response) {
    throw new Error("Search service is temporarily unavailable");
  }

  if (!response.ok) {
    // log full error on the server, send a simple message to the client
    console.error(
      "Google Books API error:",
      response.status,
      await response.text(),
    );
    throw new Error("Google Books API failed");
  }

  const data = (await response.json()) as GoogleBooksResponse;

  // no title = useless. skip
  const books = (data.items || [])
    .filter((item) => item.volumeInfo.title)
    .map((item) => ({
      title: item.volumeInfo.title!,
      author: item.volumeInfo.authors?.[0] ?? "Unknown",
      genres: item.volumeInfo.categories ?? [],
      coverImage: pickBestGoogleCover(item.volumeInfo.imageLinks),
      externalApiId: item.id,
    }));

  return books;
}
