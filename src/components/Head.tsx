/**
 * Oyuncunun kafasi (skininin yuzu).
 *
 * Sunucu cevrimdisi modda calistigi icin kimlik kullanici adi; gorsel de
 * adla isteniyor. Mojang hesabi olan adlarin skini gorunur, olmayanlar
 * varsayilan skinle gelir. Ag yoksa kirik gorsel simgesi gorunmesin.
 */
export function Head({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <img
      src={`https://mc-heads.net/avatar/${encodeURIComponent(name)}/${size}`}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-lg bg-hover"
      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
    />
  );
}
