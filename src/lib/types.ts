// Rust tarafindaki serde modellerinin birebir karsiliklari.
// Rust yapilarinda `rename_all = "camelCase"` kullanildigi icin alan
// adlari burada camelCase olarak gorunur.

export type AccountKind = "microsoft" | "offline" | "site";

export interface AccountView {
  id: string;
  username: string;
  kind: AccountKind;
  needsRefresh: boolean;
  /** "Otomatik sunucuya bağlan" ayarı bu hesaba gösterilsin mi. */
  canSkipAutoConnect: boolean;
}

export interface AccountsPayload {
  accounts: AccountView[];
  active: string | null;
}

export interface Settings {
  manifestUrl: string;
  gameDir: string | null;
  javaPath: string | null;
  ramMb: number;
  jvmArgs: string;
  hideOnLaunch: boolean;
  showAfterExit: boolean;
  autoConnect: boolean;
  msClientId: string;
  activeAccount: string | null;
}

export type LoaderKind = "vanilla" | "fabric";

export interface LoaderSpec {
  type: LoaderKind;
  version: string | null;
}

export interface ServerInfo {
  host: string;
  port: number;
  name: string | null;
}

export interface PackFile {
  path: string;
  url: string;
  sha1: string | null;
  size: number | null;
  name: string | null;
  overwrite: boolean;
}

export interface NewsItem {
  title: string;
  body: string;
  date: string | null;
  url: string | null;
}

export interface PackManifest {
  name: string;
  packVersion: string;
  minecraft: string;
  /** Ana ekrandaki gorsel; yoksa launcher kendi zeminini ciziyor. */
  banner: string | null;
  loader: LoaderSpec;
  server: ServerInfo | null;
  files: PackFile[];
  news: NewsItem[];
  javaMajor: number | null;
}

export interface InstallStatus {
  installedVersion: string | null;
  remoteVersion: string;
  needsUpdate: boolean;
}

export interface RemoteState {
  manifest: PackManifest;
  status: InstallStatus;
}

export interface SystemInfo {
  totalMemoryMb: number;
  gameDir: string;
  launcherDir: string;
  launcherVersion: string;
}

export interface Progress {
  stage: string;
  message: string;
  current: number;
  total: number;
  done: boolean;
}

export interface LogLine {
  stream: "stdout" | "stderr";
  line: string;
}

export interface ExitInfo {
  code: number | null;
  crashed: boolean;
}

export interface DeviceCodePrompt {
  userCode: string;
  verificationUri: string;
  expiresIn: number;
}

/**
 * Oyun sunucusunun anlik durumu (Server List Ping).
 *
 * `online` barindiricinin "kapali" vitrinini de hesaba katiyor: barindirici
 * kapali sunucular icin de ping'e yanit veriyor, o yuzden yanit gelmesi
 * tek basina acik demek degil.
 */
export interface ServerStatus {
  online: boolean;
  players: { online: number; max: number } | null;
  version: string | null;
  motd: string | null;
  /** Kisa aciklama - teshis icin; arayuzde adres gostermez. */
  reason: string;
}

/**
 * Bir arkadas. Siteden geliyor (`/api/launcher/friends`); yalnizca aktif
 * hesabin KENDI arkadaslari, cevrimdisi olanlar dahil.
 */
export interface Friend {
  name: string;
  online: boolean;
  /** Cevrimiciyken bulundugu sunucu; cevrimdisiyken bos. */
  server: string;
  /** ISO 8601; hic gorulmediyse null. */
  lastSeen: string | null;
}
