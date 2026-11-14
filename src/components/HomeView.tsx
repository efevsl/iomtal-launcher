import type { ReactNode } from "react";
import {
  Boxes,
  Check,
  Download,
  Files,
  RefreshCw,
  Server,
  Tag,
  Wrench,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { api } from "../lib/api";
import { useLauncher } from "../store/launcher";
import { publicAddress } from "../lib/server-name";
import { Button, Chip, Notice, Panel } from "./ui";

export function HomeView() {
  const { manifest, status, manifestError, busy, server } = useLauncher(
    useShallow((s) => ({
      manifest: s.manifest,
      status: s.status,
      manifestError: s.manifestError,
      busy: s.busy,
      server: s.serverStatus,
    })),
  );

  const install = useLauncher((s) => s.install);
  const refreshRemote = useLauncher((s) => s.refreshRemote);

  if (manifestError) {
    return (
      <div className="space-y-4">
        <Notice tone="error">Paket bilgisi alınamadı: {manifestError}</Notice>
        <Panel
          title="Paket kaynağı"
          subtitle="Sunucunun yayınladığı manifest adresine ulaşılamadı. Ağ bağlantını kontrol et."
        >
          <Button onClick={() => refreshRemote()}>
            <RefreshCw size={15} />
            Tekrar dene
          </Button>
        </Panel>
      </div>
    );
  }

  if (!manifest) {
    return <Skeleton />;
  }

  const upToDate = status && !status.needsUpdate;

  return (
    <div className="space-y-4">
      {/* --- paket kimligi ---
          Ust kisim bir gorsel: manifestte banner varsa o, yoksa
          launcher kendi zeminini ciziyor. Gorsel asagi dogru beyaza
          eriyor ki uzerindeki yazi her gorselde okunakli kalsin. */}
      <section
        className="enter lift overflow-hidden rounded-2xl border border-line bg-card"
        style={{ animationDelay: "40ms" }}
      >
        <div className="relative h-[172px] overflow-hidden">
          {/* Zemin - gorsel yoksa ya da yuklenemezse gorunen katman.
              Paketin adini dev harflerle tekrar etmek yerine kare bir
              izgara: oyun bloklardan olusuyor, izgara bunu susleme
              yapmadan hatirlatiyor ve alttaki basligi tekrarlamiyor. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-brand-tint via-page to-hover"
            style={{
              backgroundImage:
                "linear-gradient(rgba(196,12,12,0.055) 1px, transparent 1px)," +
                "linear-gradient(90deg, rgba(196,12,12,0.055) 1px, transparent 1px)," +
                "linear-gradient(135deg, #fdecec 0%, #f8f9fc 55%, #f1f5f9 100%)",
              backgroundSize: "28px 28px, 28px 28px, 100% 100%",
            }}
          />

          {manifest.banner && (
            <img
              src={manifest.banner}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              // Adres bozuksa ya da engellenirse zemin gorunsun.
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}

          {/* Beyaza erime - yazinin altini her zaman acik birakiyor. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 42%, rgba(255,255,255,0.88) 80%, #ffffff 100%)",
            }}
          />

          <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
            <span className="rounded-full bg-white/85 p-0.5 backdrop-blur-sm">
              {upToDate ? (
                <Chip tone="ok">
                  <Check size={12} strokeWidth={3} />
                  Güncel
                </Chip>
              ) : (
                <Chip tone="warn">
                  {status?.installedVersion ? "Güncelleme var" : "Kurulu değil"}
                </Chip>
              )}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-3 px-6">
            <p className="eyebrow text-brand">Modpack</p>
            <h1 className="mt-1 truncate text-[28px] font-bold leading-tight tracking-tight text-ink">
              {manifest.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-6 pb-5 pt-2">
          <MetaTag icon={Boxes} value={`Minecraft ${manifest.minecraft}`} />
          <MetaTag
            icon={Tag}
            value={
              manifest.loader.type === "fabric"
                ? `Fabric${manifest.loader.version ? ` ${manifest.loader.version}` : ""}`
                : "Vanilla"
            }
          />
          <MetaTag icon={Files} value={`${manifest.files.length} dosya`} />
          <MetaTag icon={Tag} value={`Paket v${manifest.packVersion}`} />
          {status?.installedVersion && (
            <span className="tnum ml-auto text-[11px] font-medium text-ink-faint">
              kurulu v{status.installedVersion}
            </span>
          )}
        </div>

        {manifest.server && (
          <div className="flex items-center gap-3 border-t border-line-soft bg-page px-6 py-3.5">
            <Server size={15} className="shrink-0 text-ink-mute" />
            <span className="text-[12px] font-semibold text-ink-soft">Sunucu</span>
            <span className="selectable truncate font-mono text-[13px] font-medium text-ink">
              {publicAddress(manifest.server)}
            </span>
            <span className="ml-auto shrink-0">
              {!server ? (
                <Chip>Kontrol ediliyor</Chip>
              ) : server.online ? (
                <Chip tone="ok">Açık · {server.players?.online ?? 0} oyuncu</Chip>
              ) : (
                <Chip tone="warn">Kapalı · açılması bekleniyor</Chip>
              )}
            </span>
          </div>
        )}
      </section>

      {/* --- bakim --- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Maintenance
          delay={110}
          icon={Download}
          title="Güncelle"
          body="Eksik dosyaları indirir, listeden çıkan modları temizler."
          action={
            <Button disabled={busy} onClick={() => install(false)}>
              <Download size={15} />
              Kurulumu güncelle
            </Button>
          }
        />
        <Maintenance
          delay={150}
          icon={Wrench}
          title="Onar"
          body="Tüm dosyaların SHA-1 doğrulamasını yapar. Bozuk indirmeler için."
          action={
            <Button disabled={busy} onClick={() => install(true)}>
              <Wrench size={15} />
              Dosyaları onar
            </Button>
          }
        />
      </div>

      {/* --- duyurular --- */}
      {manifest.news.length > 0 && (
        <section
          className="enter lift overflow-hidden rounded-2xl border border-line bg-card"
          style={{ animationDelay: "190ms" }}
        >
          <h2 className="border-b border-line-soft px-5 py-4 text-[15px] font-bold text-ink">
            Duyurular
          </h2>
          <ul>
            {manifest.news.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="border-b border-line-soft px-5 py-4 last:border-b-0"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-[14px] font-semibold text-ink">{item.title}</h3>
                  {item.date && (
                    <span className="tnum shrink-0 text-[11px] font-medium text-ink-faint">
                      {item.date}
                    </span>
                  )}
                </div>
                {item.body && (
                  <p className="selectable mt-1.5 max-w-prose text-[13px] leading-relaxed text-ink-soft">
                    {item.body}
                  </p>
                )}
                {item.url && (
                  <button
                    onClick={() => api.openExternal(item.url!)}
                    className="mt-2.5 cursor-pointer text-[12px] font-bold text-brand transition-colors hover:text-brand-hot"
                  >
                    Devamını oku →
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function MetaTag({ icon: Icon, value }: { icon: typeof Boxes; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-hover px-3 py-1.5 text-[12px] font-semibold text-ink-soft">
      <Icon size={13} className="shrink-0 text-ink-mute" />
      {value}
    </span>
  );
}

function Maintenance({
  icon: Icon,
  title,
  body,
  action,
  delay,
}: {
  icon: typeof Boxes;
  title: string;
  body: string;
  action: ReactNode;
  delay: number;
}) {
  return (
    <section
      className="enter lift flex flex-col rounded-2xl border border-line bg-card p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-tint text-brand">
        <Icon size={17} />
      </span>
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      <p className="mb-4 mt-1 flex-1 text-[13px] leading-relaxed text-ink-soft">{body}</p>
      <div>{action}</div>
    </section>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4">
      {/* Bos kutular yerine calistigi belli olan kutular: ust kenarda
          kirmizi bir blok gidip geliyor. */}
      <div className="h-44 overflow-hidden rounded-2xl border border-line bg-card">
        <div className="shuttle h-[3px] w-1/4 rounded-full bg-brand" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-36 rounded-2xl border border-line bg-card" />
        <div className="h-36 rounded-2xl border border-line bg-card" />
      </div>
    </div>
  );
}
