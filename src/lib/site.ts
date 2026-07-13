export const SITE_URL = "https://awards.terraolivo-iooc.com";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
