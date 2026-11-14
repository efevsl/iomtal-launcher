import type { ServerInfo } from "./types";

/** Oyunculara gosterilen genel adres. */
const PUBLIC_ADDRESS = "oyna.iomtalsmp.com";

/** Bizim sunucumuza ait adresler. */
const BACKEND_HOSTS = new Set(["oyna.iomtalsmp.com"]);

function isOurs(host: string): boolean {
  const name = host.toLowerCase();
  return (
    BACKEND_HOSTS.has(name) ||
    name === "iomtalsmp.com" ||
    name.endsWith(".iomtalsmp.com")
  );
}

/**
 * Ekranda gosterilecek sunucu adresi.
 *
 * Kendi sunucumuzsa genel adres (port da gizleniyor - genel adres
 * varsayilan porttan geliyor). Baska bir adres olursa oldugu gibi
 * gosteriliyor; orayi gizlemek gosterilen bilgiyi yalan yapardi.
 */
export function publicAddress(server: ServerInfo | null | undefined): string | null {
  if (!server?.host) {
    return null;
  }

  if (isOurs(server.host)) {
    return PUBLIC_ADDRESS;
  }

  return server.port === 25565 ? server.host : `${server.host}:${server.port}`;
}
