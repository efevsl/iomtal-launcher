import { useEffect, useState } from "react";
import { FolderOpen, House, Lock, Search } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { api } from "../lib/api";
import { selectActiveAccount, useLauncher } from "../store/launcher";
import { publicAddress } from "../lib/server-name";
import { Button, Panel, Field, TextInput, Toggle } from "./ui";

export function SettingsView() {
  const { settings, system, manifest, status } = useLauncher(
    useShallow((s) => ({
      settings: s.settings,
      system: s.system,
      manifest: s.manifest,
      status: s.status,
    })),
  );

  const account = useLauncher(selectActiveAccount);
  const saveSettings = useLauncher((s) => s.saveSettings);
  const [detectedJava, setDetectedJava] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  // Bellek kaydiricisinin ust siniri: sistemin toplam RAM'inin dortte ucu.
  // Tamamini vermek isletim sistemini ac birakiyor.
  const maxRam = system
    ? Math.max(2048, Math.floor((system.totalMemoryMb * 0.75) / 512) * 512)
    : 8192;

  useEffect(() => {
    setDetectedJava(null);
  }, [settings?.javaPath]);

  if (!settings) return null;

  const detectJava = async () => {
    setDetecting(true);
    try {
      const major = manifest?.javaMajor ?? 21;
      setDetectedJava((await api.detectJava(major)) ?? "bulunamadı");
    } finally {
      setDetecting(false);
    }
  };

  // Ayar yalnizca izinli hesaplarda anlamli; digerleri her zaman
  // sunucuya sokuluyor, ayar dosyasinda ne yazarsa yazsin.
  const connects = settings.autoConnect || !account?.canSkipAutoConnect;

  // Paneller sirayla yerine oturuyor.
  const step = (index: number) => ({ animationDelay: `${index * 55}ms` });

  return (
    <div className="space-y-4">
      <Panel
        className="enter"
        style={step(0)}
        title="Paket kaynağı"
        subtitle="Bu launcher yalnızca IOMTAL SMP için çalışır; kaynak adresi sabittir."
      >
        <p className="selectable break-all rounded-xl border border-line bg-page px-3.5 py-2.5 font-mono text-[12px] text-ink-soft">
          {settings.manifestUrl}
        </p>
      </Panel>

      <Panel
        className="enter"
        style={step(1)}
        title="Bellek"
        subtitle="Modlu kurulumlarda 4-6 GB genellikle yeterlidir."
      >
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={1024}
            max={maxRam}
            step={512}
            value={Math.min(settings.ramMb, maxRam)}
            onChange={(e) => saveSettings({ ramMb: Number(e.target.value) })}
            className="range h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-line"
          />
          <span className="tnum w-24 shrink-0 text-right text-[15px] font-bold text-ink">
            {(settings.ramMb / 1024).toFixed(1)} GB
          </span>
        </div>
        {system && (
          <p className="mt-3 text-[12px] text-ink-mute">
            Sistemde toplam {(system.totalMemoryMb / 1024).toFixed(1)} GB bellek var.
          </p>
        )}
      </Panel>

      <Panel
        className="enter"
        style={step(2)}
        title="Java"
        subtitle="Boş bırakılırsa doğru sürüm otomatik bulunur veya indirilir."
      >
        <Field
          label="java(w).exe yolu"
          hint="Özel bir JVM kullanmak istemiyorsan boş bırak."
        >
          <TextInput
            value={settings.javaPath ?? ""}
            placeholder="Otomatik"
            spellCheck={false}
            onChange={(e) => saveSettings({ javaPath: e.target.value || null })}
          />
        </Field>
        <div className="mt-3 flex items-center gap-3">
          <Button variant="secondary" disabled={detecting} onClick={detectJava}>
            <Search size={15} />
            Java bul
          </Button>
          {detectedJava && (
            <span className="selectable truncate font-mono text-[12px] text-ink-soft">
              {detectedJava}
            </span>
          )}
        </div>
      </Panel>

      <Panel
        className="enter"
        style={step(3)}
        title="Başlatma"
        subtitle="Oyun açılırken launcher nasıl davransın."
      >
        <div className="divide-y divide-line-soft">
          <Toggle
            label="Oyun açılınca launcher'ı gizle"
            checked={settings.hideOnLaunch}
            onChange={(v) => saveSettings({ hideOnLaunch: v })}
          />
          <Toggle
            label="Oyun kapanınca launcher'ı geri getir"
            checked={settings.showAfterExit}
            onChange={(v) => saveSettings({ showAfterExit: v })}
          />
          {account?.canSkipAutoConnect && (
            <Toggle
              label="Otomatik sunucuya bağlan"
              hint="Kapalıyken oyun ana menüde açılır."
              checked={settings.autoConnect}
              onChange={(v) => saveSettings({ autoConnect: v })}
            />
          )}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-page px-4 py-3.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
            {connects ? <Lock size={15} /> : <House size={15} />}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-ink">
              {connects
                ? "Sunucuya doğrudan bağlanılır"
                : "Oyun ana menüde açılır"}
            </p>
            <p className="selectable mt-0.5 truncate font-mono text-[12px] text-ink-soft">
              {publicAddress(manifest?.server) ?? "sunucu adresi henüz tanımlı değil"}
            </p>
          </div>
        </div>
      </Panel>

      <Panel
        className="enter"
        style={step(4)}
        title="Gelişmiş"
        subtitle="JVM parametreleri ve oyun klasörünün yeri."
      >
        <div className="space-y-4">
          <Field
            label="Ek JVM parametreleri"
            hint="-Xmx / -Xms burada belirtilse bile yukarıdaki bellek ayarı geçerlidir."
          >
            <TextInput
              value={settings.jvmArgs}
              spellCheck={false}
              className="font-mono text-[12px]"
              onChange={(e) => saveSettings({ jvmArgs: e.target.value })}
            />
          </Field>

          <Field
            label="Oyun klasörü"
            hint="Boş bırakılırsa launcher kendi klasörünü kullanır."
          >
            <TextInput
              value={settings.gameDir ?? ""}
              placeholder={system?.gameDir ?? "Otomatik"}
              spellCheck={false}
              className="font-mono text-[12px]"
              onChange={(e) => saveSettings({ gameDir: e.target.value || null })}
            />
          </Field>

          <Button variant="secondary" onClick={() => api.openGameFolder()}>
            <FolderOpen size={15} />
            Klasörü aç
          </Button>
        </div>
      </Panel>

      <Panel
        className="enter"
        style={step(5)}
        title="Sürümler"
        subtitle="Bir sorun bildirirken bu satırları da yaz; hangi sürümde olduğunu bilmek aramayı kısaltıyor."
      >
        <dl className="divide-y divide-line-soft">
          <VersionRow term="Minecraft" value={manifest?.minecraft ?? "—"} />
          <VersionRow
            term="Yükleyici"
            value={
              manifest
                ? manifest.loader.type === "fabric"
                  ? `Fabric${manifest.loader.version ? ` ${manifest.loader.version}` : " (en güncel)"}`
                  : "Vanilla"
                : "—"
            }
          />
          <VersionRow
            term="Paket"
            value={manifest ? `v${manifest.packVersion}` : "—"}
            note={
              status?.installedVersion
                ? status.installedVersion === manifest?.packVersion
                  ? "kurulu sürüm güncel"
                  : `kurulu v${status.installedVersion}`
                : "henüz kurulmadı"
            }
          />
          <VersionRow
            term="Java"
            value={manifest?.javaMajor ? `Java ${manifest.javaMajor}` : "sürüm dosyasından"}
          />
          <VersionRow term="Launcher" value={`v${system?.launcherVersion ?? "—"}`} />
        </dl>
      </Panel>
    </div>
  );
}

/** Sürüm listesinde tek satir: solda ad, sagda deger ve altinda not. */
function VersionRow({
  term,
  value,
  note,
}: {
  term: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[13px] font-medium text-ink-soft">{term}</dt>
      <dd className="min-w-0 text-right">
        <span className="tnum block truncate font-mono text-[13px] font-semibold text-ink">
          {value}
        </span>
        {note && (
          <span className="mt-0.5 block text-[11px] text-ink-faint">{note}</span>
        )}
      </dd>
    </div>
  );
}
