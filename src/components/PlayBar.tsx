import { Loader2, Play, Square, UserRound } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { selectActiveAccount, useLauncher } from "../store/launcher";

/**
 * Alt eylem seridi.
 *
 * Ekranin en agir ogesi burasi: oyuncunun launcher'da yaptigi tek is
 * "Oyna"ya basmak. Dugme arayuzdeki tek dolu kirmizi blok, gozun nereye
 * gidecegi tartismaya kalmiyor.
 *
 * Indirme sirasinda seridin ust kenari boyunca uzanan bir olcek doluyor:
 * ilerleme kucuk bir kutuya sikismiyor, serit kendisi olcek oluyor.
 */
export function PlayBar() {
  const { account, busy, gameRunning, progress, status, server } = useLauncher(
    useShallow((s) => ({
      account: selectActiveAccount(s),
      busy: s.busy,
      gameRunning: s.gameRunning,
      progress: s.progress,
      status: s.status,
      server: s.serverStatus,
    })),
  );

  // Sunucu kapaliyken Oyna yine calisiyor: durum tespiti yanilirsa
  // (ag engeli, DNS) oyuncuyu kilitlemek, yanlis bir uyari gostermekten
  // cok daha kotu. Yalnizca durum satiri uyariyor.
  const serverDown = server !== null && !server.online;

  const play = useLauncher((s) => s.play);
  const killGame = useLauncher((s) => s.killGame);
  const setView = useLauncher((s) => s.setView);

  const needsUpdate = status?.needsUpdate ?? false;
  const canPlay = !!account && !busy && !gameRunning;

  const working = progress && !progress.done ? progress : null;
  const percent =
    working && working.total > 0
      ? Math.min(100, (working.current / working.total) * 100)
      : 0;
  // Toplam bilinmiyorsa yuzde yalan olur; onun yerine hareket gosteriyoruz.
  const indeterminate = !working || working.total <= 1;

  return (
    <footer className="rise relative flex shrink-0 items-center gap-4 border-t border-line bg-card px-4 py-3">
      {working && (
        <div className="absolute inset-x-0 -top-px h-[3px] overflow-hidden bg-line-soft">
          {indeterminate ? (
            <div className="shuttle h-full w-1/4 rounded-full bg-brand" />
          ) : (
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-200 ease-out"
              style={{ width: `${percent}%` }}
            />
          )}
        </div>
      )}

      {/* --- hesap --- */}
      <button
        onClick={() => setView("accounts")}
        className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-hover"
      >
        {account ? (
          <img
            src={`https://mc-heads.net/avatar/${encodeURIComponent(
              account.kind === "microsoft" ? account.id : account.username,
            )}/32`}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg bg-hover"
            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-hover text-ink-mute">
            <UserRound size={16} />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-ink">
            {account?.username ?? "Hesap seç"}
          </span>
          <span className="block text-[11px] font-medium text-ink-mute">
            {account
              ? account.kind === "site"
                ? "IOMTAL hesabı"
                : account.kind === "microsoft"
                  ? "Microsoft"
                  : "Çevrimdışı"
              : "Gerekli"}
          </span>
        </span>
      </button>

      {/* --- durum / ilerleme --- */}
      <div className="min-w-0 flex-1">
        {working ? (
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[13px] font-medium text-ink">
              {working.message}
            </span>
            {!indeterminate && (
              <span className="tnum shrink-0 text-[13px] font-semibold text-ink-soft">
                {Math.round(percent)}%
              </span>
            )}
          </div>
        ) : (
          <p className="truncate text-[13px] text-ink-mute">
            {gameRunning
              ? "Oyun çalışıyor"
              : serverDown
                ? "Sunucu kapalı · açıldığında haber vereceğim"
                : needsUpdate
                  ? "Oynamadan önce dosyalar inecek"
                  : status
                    ? "Her şey hazır"
                    : ""}
          </p>
        )}
      </div>

      {/* --- eylem --- */}
      {gameRunning ? (
        <button
          onClick={killGame}
          className="clickbox flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-danger-line bg-danger-tint px-6 py-3 text-[13px] font-bold text-danger hover:bg-[#fde4e4]"
        >
          <Square size={15} />
          Oyunu kapat
        </button>
      ) : (
        <button
          onClick={play}
          disabled={!canPlay}
          title={account ? undefined : "Önce bir hesap ekleyin"}
          className="clickbox flex min-w-[168px] shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-brand px-7 py-3 text-[14px] font-bold text-white hover:bg-brand-hot disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-faint"
        >
          {busy ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Hazırlanıyor
            </>
          ) : (
            <>
              <Play size={17} fill="currentColor" />
              {needsUpdate ? "İndir ve oyna" : "Oyna"}
            </>
          )}
        </button>
      )}
    </footer>
  );
}
