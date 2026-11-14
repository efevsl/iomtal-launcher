import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { events } from "./lib/api";
import { useLauncher } from "./store/launcher";

import { AccountsView } from "./components/AccountsView";
import { ConsoleView } from "./components/ConsoleView";
import { DeviceCodeDialog } from "./components/DeviceCodeDialog";
import { FriendsView } from "./components/FriendsView";
import { HomeView } from "./components/HomeView";
import { PlayBar } from "./components/PlayBar";
import { SettingsView } from "./components/SettingsView";
import { Sidebar } from "./components/Sidebar";
import { TitleBar } from "./components/TitleBar";
import { Notice } from "./components/ui";

export default function App() {
  // Yalnizca burada kullanilan alanlari seciyoruz: konsol satirlari
  // saniyede yuzlerce kez degisebiliyor ve tum agaci yeniden cizmemeli.
  const { view, ready, error, notice } = useLauncher(
    useShallow((s) => ({
      view: s.view,
      ready: s.ready,
      error: s.error,
      notice: s.notice,
    })),
  );

  // Eylemler store olusturuldugunda sabitlenir; ayri ayri secmek guvenli.
  const bootstrap = useLauncher((s) => s.bootstrap);
  const dismissError = useLauncher((s) => s.dismissError);
  const dismissNotice = useLauncher((s) => s.dismissNotice);
  const pushLog = useLauncher((s) => s.pushLog);
  const setProgress = useLauncher((s) => s.setProgress);
  const setGameRunning = useLauncher((s) => s.setGameRunning);
  const setDevicePrompt = useLauncher((s) => s.setDevicePrompt);
  const setView = useLauncher((s) => s.setView);

  // Backend olaylarina abone ol. Aboneler bilesen omrunce yasar; StrictMode
  // altinda iki kez calisabildigi icin temizlik fonksiyonlarini bekliyoruz.
  useEffect(() => {
    const subscriptions = [
      events.onProgress(setProgress),
      events.onLog(pushLog),
      events.onDeviceCode(setDevicePrompt),
      events.onExit((info) => {
        setGameRunning(false);
        setProgress(null);
        if (info.crashed) {
          useLauncher.setState({
            error: `Oyun beklenmedik şekilde kapandı (çıkış kodu ${info.code}). Konsol sekmesinde ayrıntılar var.`,
          });
        }
      }),
    ];

    return () => {
      subscriptions.forEach((p) => p.then((unlisten) => unlisten()));
    };
  }, [pushLog, setProgress, setGameRunning, setDevicePrompt]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-page">
      <TitleBar />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col">
          {/* Icerik sutunu bir kolon: konsol gibi kendi kaydirmasini
              yoneten gorunumler kalan yuksekligi aliyor, uzun sayfalar
              ise bu sutunda kayiyor. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-auto p-5">
            {(error || notice) && (
              <div className="mb-4 space-y-2">
                {error && (
                  <Notice tone="error" onDismiss={dismissError}>
                    {error}
                  </Notice>
                )}
                {notice && (
                  <Notice tone="info" onDismiss={dismissNotice}>
                    {notice}
                  </Notice>
                )}
              </div>
            )}

            {!ready ? (
              <p className="enter text-[13px] text-ink-mute">Yükleniyor…</p>
            ) : (
              // key={view}: gorunum degisince bilesen yeniden kuruluyor ve
              // giris animasyonu her sekmede bastan oynuyor.
              <div key={view} className="enter flex min-h-0 flex-1 flex-col">
                {view === "home" && <HomeView />}
                {view === "friends" && <FriendsView />}
                {view === "accounts" && <AccountsView />}
                {view === "settings" && <SettingsView />}
                {view === "console" && <ConsoleView />}
              </div>
            )}
          </div>

          <PlayBar />
        </main>
      </div>

      <DeviceCodeDialog />

      {/* Hata mesaji konsola yonlendirme istiyorsa hizli erisim. */}
      {error?.includes("Konsol") && (
        <button
          onClick={() => setView("console")}
          className="clickbox enter absolute bottom-24 right-6 cursor-pointer rounded-xl border border-line bg-card px-3.5 py-2 text-[12px] font-semibold text-ink shadow-[0_4px_14px_rgba(0,0,0,0.10)]"
        >
          Konsolu aç
        </button>
      )}
    </div>
  );
}
