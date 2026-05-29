import type { BookSearchResult } from "./types.js";

type OpenLibraryDoc = {
  title?: string;
  author_name?: string[];
  subject?: string[];
  cover_i?: number; // numeric cover id, becomes URL
  key: string; // /works/OL12345W
};
type OpenLibraryResponse = {
  numFound?: number;
  docs?: OpenLibraryDoc[];
};

// open library search. Used as fallback when google fails
export async function searchOpenLibrary(
  q: string,
): Promise<BookSearchResult[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;

  // retry 5xx (api issue). 4xx = my bug, bail
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
      "OpenLibrary API error:",
      response.status,
      await response.text(),
    );
    throw new Error("OpenLibrary API failed");
  }

  const data = (await response.json()) as OpenLibraryResponse;

  // no title = useless. skip
  const books = (data.docs || [])
    .filter((doc) => doc.title)
    .map((doc) => ({
      title: doc.title!,
      author: doc.author_name?.[0] ?? "Unknown",
      genres: doc.subject ?? [],
      coverImage: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : "",
      externalApiId: doc.key,
    }));
  return books;
}
