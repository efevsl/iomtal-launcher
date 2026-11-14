import { create } from "zustand";
import { getCurrentWindow, UserAttentionType } from "@tauri-apps/api/window";

import { api, errorText } from "../lib/api";
import type {
  AccountView,
  DeviceCodePrompt,
  InstallStatus,
  LogLine,
  PackManifest,
  Progress,
  ServerStatus,
  Settings,
  SystemInfo,
} from "../lib/types";

export type View = "home" | "friends" | "accounts" | "settings" | "console";

/** Konsolda tutulacak en fazla satir sayisi; bellek sismesin. */
const LOG_LIMIT = 2000;

/**
 * Sunucu yoklama araliklari.
 *
 * Kapaliyken sik bakiyoruz: oyuncunun tek derdi sunucunun ne zaman
 * acilacagi, bunu dakikalar sonra ogrenmesi anlamsiz. Aciksa seyrek -
 * yalnizca oyuncu sayisi tazelensin diye.
 */
const WATCH_OFFLINE_MS = 10_000;
const WATCH_ONLINE_MS = 45_000;

/** Tek bir yoklama dongusu calissin; ikinci baslatma yok sayiliyor. */
let watchTimer: ReturnType<typeof setTimeout> | null = null;

interface LauncherState {
  ready: boolean;
  view: View;

  settings: Settings | null;
  system: SystemInfo | null;

  accounts: AccountView[];
  activeAccountId: string | null;

  manifest: PackManifest | null;
  status: InstallStatus | null;
  /** Manifest cekilemedi (ag yok, adres yanlis vb.) */
  manifestError: string | null;

  /** Sunucunun son bilinen durumu; henuz yoklanmadiysa null. */
  serverStatus: ServerStatus | null;

  progress: Progress | null;
  busy: boolean;
  gameRunning: boolean;
  logs: LogLine[];

  error: string | null;
  notice: string | null;
  devicePrompt: DeviceCodePrompt | null;

  setView: (view: View) => void;
  dismissError: () => void;
  dismissNotice: () => void;
  closeDevicePrompt: () => void;

  bootstrap: () => Promise<void>;
  refreshRemote: () => Promise<void>;
  startServerWatch: () => void;
  refreshAccounts: () => Promise<void>;

  saveSettings: (patch: Partial<Settings>) => Promise<void>;

  loginMicrosoft: () => Promise<void>;
  loginOffline: (username: string) => Promise<void>;
  loginSite: (username: string, password: string) => Promise<void>;
  selectAccount: (id: string) => Promise<void>;
  removeAccount: (id: string) => Promise<void>;

  play: () => Promise<void>;
  install: (repair: boolean) => Promise<void>;
  killGame: () => Promise<void>;

  pushLog: (line: LogLine) => void;
  clearLogs: () => void;
  setProgress: (progress: Progress | null) => void;
  setGameRunning: (running: boolean) => void;
  setDevicePrompt: (prompt: DeviceCodePrompt | null) => void;
}

export const useLauncher = create<LauncherState>((set, get) => ({
  ready: false,
  view: "home",

  settings: null,
  system: null,

  accounts: [],
  activeAccountId: null,

  manifest: null,
  status: null,
  manifestError: null,

  serverStatus: null,

  progress: null,
  busy: false,
  gameRunning: false,
  logs: [],

  error: null,
  notice: null,
  devicePrompt: null,

  setView: (view) => set({ view }),
  dismissError: () => set({ error: null }),
  dismissNotice: () => set({ notice: null }),
  closeDevicePrompt: () => set({ devicePrompt: null }),

  async bootstrap() {
    try {
      const [settings, accounts, system, gameRunning] = await Promise.all([
        api.getSettings(),
        api.listAccounts(),
        api.systemInfo(),
        api.isGameRunning(),
      ]);

      set({
        settings,
        system,
        accounts: accounts.accounts,
        activeAccountId: accounts.active,
        gameRunning,
        ready: true,
      });
    } catch (e) {
      set({ error: errorText(e), ready: true });
    }

    // Manifest ayri cekilir: sunucu erisilemezse launcher yine de acilsin.
    await get().refreshRemote();

    // Manifest gelmese de dongu baslar; adres ogrenilince yoklamaya gecer.
    get().startServerWatch();
  },

  startServerWatch() {
    if (watchTimer) return;

    const tick = async () => {
      const { manifest, gameRunning } = get();
      const server = manifest?.server;
      let next = WATCH_OFFLINE_MS;

      // Oyun aciksa oyuncu zaten sunucuda; yoklamak bosa ag trafigi.
      if (server && !gameRunning) {
        const previous = get().serverStatus;
        const current = await api.serverStatus(server.host, server.port).catch(() => null);

        if (current) {
          set({ serverStatus: current });

          // Kapali -> acik gecisi: oyuncuya haber ver. Ilk yoklamada
          // (onceki durum bilinmiyorken) haber verilmiyor - launcher
          // acildiginda sunucu zaten aciksa bu bir "acildi" haberi degil.
          if (current.online && previous && !previous.online) {
            set({ notice: "Sunucu açıldı — oynayabilirsin." });
            try {
              // Launcher simge durumundaysa gorev cubugunda yanip sonsun.
              await getCurrentWindow().requestUserAttention(UserAttentionType.Informational);
            } catch {
              // Tarayicida onizlerken pencere yok; sessizce gec.
            }
          }

          next = current.online ? WATCH_ONLINE_MS : WATCH_OFFLINE_MS;
        }
      } else if (gameRunning) {
        next = WATCH_ONLINE_MS;
      }

      watchTimer = setTimeout(tick, next);
    };

    // Ilk yoklama hemen; sonraki araliklari sonuc belirliyor.
    watchTimer = setTimeout(tick, 0);
  },

  async refreshRemote() {
    try {
      const remote = await api.fetchRemoteState();
      set({
        manifest: remote.manifest,
        status: remote.status,
        manifestError: null,
      });
    } catch (e) {
      set({ manifestError: errorText(e) });
    }
  },

  async refreshAccounts() {
    const payload = await api.listAccounts();
    set({ accounts: payload.accounts, activeAccountId: payload.active });
  },

  async saveSettings(patch) {
    const current = get().settings;
    if (!current) return;

    const next = { ...current, ...patch };
    // Iyimser guncelleme: form alanlari beklemeden tepki versin.
    set({ settings: next });

    try {
      const saved = await api.updateSettings(next);
      set({ settings: saved });
    } catch (e) {
      set({ settings: current, error: errorText(e) });
    }
  },

  async loginMicrosoft() {
    set({ busy: true, error: null });
    try {
      await api.loginMicrosoft();
      await get().refreshAccounts();
      set({ notice: "Microsoft hesabi eklendi" });
    } catch (e) {
      set({ error: errorText(e) });
    } finally {
      set({ busy: false, devicePrompt: null });
    }
  },

  async loginOffline(username) {
    set({ busy: true, error: null });
    try {
      await api.loginOffline(username);
      await get().refreshAccounts();
      set({ notice: `${username} eklendi` });
    } catch (e) {
      set({ error: errorText(e) });
    } finally {
      set({ busy: false });
    }
  },

  async loginSite(username, password) {
    set({ busy: true, error: null });
    try {
      await api.loginSite(username, password);
      await get().refreshAccounts();
      set({ notice: `Hos geldin, ${username}` });
    } catch (e) {
      set({ error: errorText(e) });
    } finally {
      set({ busy: false });
    }
  },

  async selectAccount(id) {
    try {
      await api.setActiveAccount(id);
      set({ activeAccountId: id });
    } catch (e) {
      set({ error: errorText(e) });
    }
  },

  async removeAccount(id) {
    try {
      await api.removeAccount(id);
      await get().refreshAccounts();
    } catch (e) {
      set({ error: errorText(e) });
    }
  },

  async play() {
    set({ busy: true, error: null, progress: null });
    try {
      await api.play();
      set({ gameRunning: true });
      await get().refreshRemote();
    } catch (e) {
      set({ error: errorText(e), progress: null });
    } finally {
      set({ busy: false });
    }
  },

  async install(repair) {
    set({ busy: true, error: null, progress: null });
    try {
      await api.installPack(repair);
      await get().refreshRemote();
      set({ notice: repair ? "Dosyalar onarıldı" : "Kurulum güncel" });
    } catch (e) {
      set({ error: errorText(e) });
    } finally {
      set({ busy: false, progress: null });
    }
  },

  async killGame() {
    try {
      await api.killGame();
      set({ gameRunning: false });
    } catch (e) {
      set({ error: errorText(e) });
    }
  },

  pushLog(line) {
    const logs = get().logs;
    const next = logs.length >= LOG_LIMIT ? logs.slice(logs.length - LOG_LIMIT + 1) : logs.slice();
    next.push(line);
    set({ logs: next });
  },

  clearLogs: () => set({ logs: [] }),
  setProgress: (progress) => set({ progress }),
  setGameRunning: (gameRunning) => set({ gameRunning }),
  setDevicePrompt: (devicePrompt) => set({ devicePrompt }),
}));

/** Aktif hesabi secen yardimci. */
export function selectActiveAccount(state: LauncherState): AccountView | null {
  return state.accounts.find((a) => a.id === state.activeAccountId) ?? null;
}
