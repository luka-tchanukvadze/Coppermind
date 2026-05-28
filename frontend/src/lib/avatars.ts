// The ten Knights Radiant orders. Stored in User.photo as a filename
// (matches the schema's String field). Files live in /public/avatars/.

export type AvatarOption = {
  id: string;
  filename: string;
  name: string;
  attributes: string;
  gem: string;
};

export const AVATAR_OPTIONS: readonly AvatarOption[] = [
  {
    id: "windrunners",
    filename: "windrunners.svg",
    name: "Windrunners",
    attributes: "Protecting & Leading",
    gem: "Sapphire",
  },
  {
    id: "skybreakers",
    filename: "skybreakers.svg",
    name: "Skybreakers",
    attributes: "Just & Confident",
    gem: "Smokestone",
  },
  {
    id: "dustbringers",
    filename: "dustbringers.svg",
    name: "Dustbringers",
    attributes: "Brave & Obedient",
    gem: "Ruby",
  },
  {
    id: "edgedancers",
    filename: "edgedancers.svg",
    name: "Edgedancers",
    attributes: "Loving & Remembering",
    gem: "Topaz",
  },
  {
    id: "truthwatchers",
    filename: "truthwatchers.svg",
    name: "Truthwatchers",
    attributes: "Learned & Giving",
    gem: "Moissanite",
  },
  {
    id: "lightweavers",
    filename: "lightweavers.svg",
    name: "Lightweavers",
    attributes: "Creative & Honest",
    gem: "Garnet",
  },
  {
    id: "elsecallers",
    filename: "elsecallers.svg",
    name: "Elsecallers",
    attributes: "Wise & Careful",
    gem: "Zircon",
  },
  {
    id: "willshapers",
    filename: "willshapers.svg",
    name: "Willshapers",
    attributes: "Resolute & Builder",
    gem: "Emerald",
  },
  {
    id: "stonewards",
    filename: "stonewards.svg",
    name: "Stonewards",
    attributes: "Dependable & Resourceful",
    gem: "Amethyst",
  },
  {
    id: "bondsmiths",
    filename: "bondsmiths.svg",
    name: "Bondsmiths",
    attributes: "Pious & Guiding",
    gem: "Diamond",
  },
] as const;

// Resolves whatever the backend stores in User.photo to a usable img src.
// Three cases:
//   - empty/legacy "default.jpg" -> fall back to Windrunners
//   - already a full URL or absolute path -> use as-is (future-proofing for uploads)
//   - bare filename like "skybreakers.svg" -> prefix with /avatars/
export function avatarSrc(photo: string | undefined | null): string {
  if (!photo || photo === "default.jpg") return "/avatars/windrunners.svg";
  if (photo.startsWith("/") || photo.startsWith("http")) return photo;
  return `/avatars/${photo}`;
}

// Maps a stored photo filename back to its Knights Radiant order name.
// Used as a public-safe subtitle on profile/find-user cards where we used
export function orderFromPhoto(
  photo: string | undefined | null,
): string | null {
  if (!photo || photo === "default.jpg") return null;
  // strip optional path + ".svg" extension to get the id
  const filename = photo.split("/").pop() ?? photo;
  const id = filename.replace(/\.svg$/, "");
  return AVATAR_OPTIONS.find((o) => o.id === id)?.name ?? null;
}
