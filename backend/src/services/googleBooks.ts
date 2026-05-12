export type BookSearchResult = {
  title: string;
  author: string;
  genres: string[];
  coverImage: string;
  externalApiId: string;
};

type GoogleBookItem = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    categories?: string[];
    imageLinks?: { thumbnail?: string };
  };
};

type GoogleBooksResponse = {
  items?: GoogleBookItem[];
};

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
      coverImage: item.volumeInfo.imageLinks?.thumbnail ?? "",
      externalApiId: item.id,
    }));

  return books;
}
