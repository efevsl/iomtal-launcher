/**
 * "Son gorulme" gibi gecen sureyi kabaca Turkce yazar.
 *
 * Sunucu eklentisindeki `Zaman` ile ayni esikleri kullaniyor: oyunda
 * `/arkadas liste` ile launcher'da ayni arkadas icin ayni sure gorunsun.
 */
export function sinceText(iso: string | null, now: number = Date.now()): string {
  if (!iso) return "bilinmiyor";

  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "bilinmiyor";

  // Saat farki ya da bozuk kayit eksi sonuc verebilir.
  const diff = Math.max(0, now - time);

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "az önce";
  if (diff < hour) return `${Math.floor(diff / minute)} dk önce`;
  if (diff < day) return `${Math.floor(diff / hour)} saat önce`;
  return `${Math.floor(diff / day)} gün önce`;
}
