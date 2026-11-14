import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useLauncher } from "../store/launcher";
import { publicAddress } from "../lib/server-name";

/**
 * Pencerenin ust seridi.
 *
 * Baslik macOS'taki gibi ortada duruyor: solda sunucu adresi, sagda
 * pencere dugmeleri, tam ortada uygulamanin adi. Serit boyunca kalan
 * her yer surukleme alani.
 *
 * Marka isareti kaldirildi - iki farkli yerde (isaret + yazi) marka
 * tekrar ediyordu ve isaretin icindeki yazi bu olcude okunmuyordu.
 */
export function TitleBar() {
  // Pencere tutamagini tiklama aninda aliyoruz: render sirasinda cagirmak
  // Tauri disinda (tarayicida onizlerken) tum agaci dusuruyor.
  const win = () => getCurrentWindow();

  const { host, server } = useLauncher(
    useShallow((s) => ({
      host: publicAddress(s.manifest?.server),
      server: s.serverStatus,
    })),
  );

  // Nokta sunucunun durumunu soyluyor: acik (nefes alan yesil), kapali
  // (amber - launcher acilmasini bekliyor), henuz bilinmiyor (gri).
  // Kapali icin kirmizi degil amber: marka zaten kirmizi, ve launcher
  // burada bir hata degil bir bekleyis gosteriyor.
  const dot = !server ? "bg-ink-faint" : server.online ? "live bg-ok" : "bg-warn";
  const label = !server
    ? null
    : server.online
      ? `${server.players?.online ?? 0} çevrimiçi`
      : "kapalı";

  return (
    <header
      data-tauri-drag-region
      className="relative flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-card pl-4 pr-2"
    >
      {/* Ortadaki baslik. Mutlak konumlandi ki solda ve sagda ne olursa
          olsun seridin tam ortasinda kalsin. */}
      <div
        data-tauri-drag-region
        className="enter pointer-events-none absolute inset-x-0 flex justify-center"
      >
        <span className="text-[16px] tracking-tight">
          <span className="font-bold text-ink">IOMTAL SMP</span>{" "}
          <span className="font-medium text-ink-mute">Launcher</span>
        </span>
      </div>

      {/* Sunucu adresi ve durumu. Launcher tek bir sunucu icin var;
          adresin baslikta durmasi dogru yer. Gosterilen genel adres -
          baglanti arka uce gitse de oyuncunun gordugu bu. */}
      <div data-tauri-drag-region className="z-10 flex min-w-0 items-center">
        {host && (
          <div
            className="enter flex min-w-0 items-center gap-2 rounded-full bg-hover px-3 py-1.5"
            style={{ animationDelay: "120ms" }}
          >
            <span aria-hidden className={"h-2 w-2 shrink-0 rounded-full " + dot} />
            <span className="tnum truncate font-mono text-[11px] font-medium text-ink-soft">
              {host}
            </span>
            {label && (
              <span
                className={
                  "shrink-0 text-[11px] font-semibold " +
                  (server?.online ? "text-ok" : "text-warn")
                }
              >
                · {label}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="z-10 flex shrink-0 items-center gap-1">
        <WindowButton onClick={() => win().minimize()} label="Küçült">
          <Minus size={15} />
        </WindowButton>
        <WindowButton onClick={() => win().toggleMaximize()} label="Büyüt">
          <Square size={12} />
        </WindowButton>
        <WindowButton onClick={() => win().close()} label="Kapat" danger>
          <X size={15} />
        </WindowButton>
      </div>
    </header>
  );
}

function WindowButton({
  children,
  onClick,
  label,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-mute transition-colors " +
        (danger
          ? "hover:bg-danger-tint hover:text-danger"
          : "hover:bg-hover hover:text-ink")
      }
    >
      {children}
    </button>
  );
}
