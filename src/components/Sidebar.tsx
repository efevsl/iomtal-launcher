import clsx from "clsx";
import {
  ExternalLink,
  FolderOpen,
  HeartHandshake,
  Home,
  Settings,
  Terminal,
  Users,
} from "lucide-react";

import { useLauncher, type View } from "../store/launcher";
import { api } from "../lib/api";

const SITE_URL = "https://www.iomtalsmp.com";

const ITEMS: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Ana sayfa", icon: Home },
  { id: "friends", label: "Arkadaşlar", icon: HeartHandshake },
  { id: "accounts", label: "Hesaplar", icon: Users },
  { id: "settings", label: "Ayarlar", icon: Settings },
  { id: "console", label: "Konsol", icon: Terminal },
];

/** Bir satirin yuksekligi ve satirlar arasi bosluk (gap-1.5). */
const ROW_H = 44;
const GAP = 6;
const STEP = ROW_H + GAP;

/** Kayan gostergenin boyu - satirdan kisa. */
const MARK_H = 18;

/**
 * Sol gezinme rayi.
 *
 * Secili satirin arkasinda tonlu bir hap ve
 * sol kenarinda ince bir cubuk var; sekme degisince ikisi de yeni satira
 * kayiyor. Her satira ayri isaretci koymak yerine tek ogeyi hareket
 * ettirmek, secimin bir yerden bir yere gittigini gosteriyor.
 */
export function Sidebar() {
  const view = useLauncher((s) => s.view);
  const setView = useLauncher((s) => s.setView);

  const activeIndex = ITEMS.findIndex((item) => item.id === view);
  const visible = activeIndex >= 0;

  return (
    <nav className="flex w-[212px] shrink-0 flex-col border-r border-line bg-card">
      <div className="px-3 pt-3">
        <div className="relative flex flex-col gap-1.5">
          {/* Secili satirin hapi. */}
          <span
            aria-hidden
            className="absolute inset-x-0 rounded-[14px] bg-brand-tint transition-transform duration-300"
            style={{
              height: ROW_H,
              transform: `translateY(${Math.max(activeIndex, 0) * STEP}px)`,
              opacity: visible ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
            }}
          />

          {/* Sol kenardaki cubuk. */}
          <span
            aria-hidden
            className="absolute left-0 w-[3px] rounded-full bg-brand transition-transform duration-300"
            style={{
              height: MARK_H,
              transform: `translateY(${
                Math.max(activeIndex, 0) * STEP + (ROW_H - MARK_H) / 2
              }px)`,
              opacity: visible ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(0.2, 0, 0, 1)",
            }}
          />

          {ITEMS.map(({ id, label, icon: Icon }, index) => {
            const active = view === id;

            return (
              <button
                key={id}
                onClick={() => setView(id)}
                style={{ height: ROW_H, animationDelay: `${60 + index * 40}ms` }}
                className={clsx(
                  "enter-left relative flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-4 text-left text-[14px]",
                  "transition-colors duration-200",
                  active
                    ? "font-bold text-brand"
                    : "font-medium text-ink-mute hover:bg-hover hover:text-ink",
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hizli erisim. */}
      <div className="mt-auto px-3 pb-3">
        <p className="eyebrow mb-1.5 px-4 text-ink-faint">Hızlı erişim</p>

        <QuickLink icon={FolderOpen} label="Oyun klasörü" onClick={() => api.openGameFolder()} />
        <QuickLink
          icon={ExternalLink}
          label="iomtalsmp.com"
          onClick={() => api.openExternal(SITE_URL)}
        />
      </div>
    </nav>
  );
}

function QuickLink({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-4 py-2 text-left text-[12px] font-semibold text-ink-soft transition-colors hover:bg-hover hover:text-ink"
    >
      <Icon size={15} className="shrink-0" />
      <span className="truncate">{label}</span>
      <span className="ml-auto rounded bg-brand-tint px-1.5 py-0.5 text-[9px] font-bold text-brand opacity-0 transition-opacity group-hover:opacity-100">
        →
      </span>
    </button>
  );
}
