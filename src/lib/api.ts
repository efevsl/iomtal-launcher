// Tauri komutlarinin tiplenmiş sarmalayicilari.
// Bileşenler `invoke` cagrilarini dogrudan yapmaz; boylece komut adlari
// tek yerde durur ve tip guvenligi korunur.

import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

import type {
  AccountsPayload,
  AccountView,
  DeviceCodePrompt,
  ExitInfo,
  Friend,
  LogLine,
  Progress,
  RemoteState,
  ServerStatus,
  Settings,
  SystemInfo,
} from "./types";

export const api = {
  getSettings: () => invoke<Settings>("get_settings"),
  updateSettings: (settings: Settings) => invoke<Settings>("update_settings", { settings }),
  systemInfo: () => invoke<SystemInfo>("system_info"),
  openGameFolder: () => invoke<void>("open_game_folder"),
  openExternal: (url: string) => invoke<void>("open_external", { url }),

  listAccounts: () => invoke<AccountsPayload>("list_accounts"),
  loginMicrosoft: () => invoke<AccountView>("login_microsoft"),
  loginOffline: (username: string) => invoke<AccountView>("login_offline", { username }),
  loginSite: (username: string, password: string) =>
    invoke<AccountView>("login_site", { username, password }),
  setActiveAccount: (id: string) => invoke<void>("set_active_account", { id }),
  removeAccount: (id: string) => invoke<void>("remove_account", { id }),

  /** Aktif IOMTAL hesabinin arkadaslari (cevrimdisi olanlar dahil). */
  listFriends: () => invoke<Friend[]>("list_friends"),

  fetchRemoteState: () => invoke<RemoteState>("fetch_remote_state"),
  installPack: (repair: boolean) => invoke<void>("install_pack", { repair }),
  play: () => invoke<void>("play"),
  isGameRunning: () => invoke<boolean>("is_game_running"),
  killGame: () => invoke<void>("kill_game"),
  detectJava: (major: number) => invoke<string | null>("detect_java", { major }),

  /** Sunucuyu yoklar. Hata firlatmaz; ulasilamazsa `online: false` doner. */
  serverStatus: (host: string, port: number) =>
    invoke<ServerStatus>("server_status", { host, port }),
};

export const events = {
  onProgress: (handler: (p: Progress) => void): Promise<UnlistenFn> =>
    listen<Progress>("launcher://progress", (e) => handler(e.payload)),

  onLog: (handler: (l: LogLine) => void): Promise<UnlistenFn> =>
    listen<LogLine>("game://log", (e) => handler(e.payload)),

  onExit: (handler: (e: ExitInfo) => void): Promise<UnlistenFn> =>
    listen<ExitInfo>("game://exit", (e) => handler(e.payload)),

  onDeviceCode: (handler: (p: DeviceCodePrompt) => void): Promise<UnlistenFn> =>
    listen<DeviceCodePrompt>("auth://device-code", (e) => handler(e.payload)),
};

/** Rust tarafindan gelen hatalar string olarak serialize edilir. */
export function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return String(error);
}
