import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { RefreshCw } from "lucide-react";

import { api, errorText } from "../lib/api";
import { sinceText } from "../lib/time";
import type { Friend } from "../lib/types";
import { Head } from "./Head";
import { Button, Panel } from "./ui";

/** Liste bu aralikla kendiliginden tazelenir. */
const REFRESH_MS = 30_000;

/**
 * Arkadaslar sekmesi.
 *
 * Yalnizca aktif hesabin KENDI arkadaslari gorunur, tum oyuncular degil.
 * Cevrimdisi arkadaslar da listede (son gorulmeyle); oyun kapaliyken de
 * bakilabilsin diye veri sunucudan degil siteden geliyor.
 *
 * Arkadas ekleme / silme oyunda: `/arkadas`. Burasi yalnizca gosterir.
 */
export function FriendsView() {
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // "5 dk once" yazilari kendiliginden eskimesin.
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFriends(await api.listFriends());
      setError(null);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
      setNow(Date.now());
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  const onlineCount = friends?.filter((f) => f.online).length ?? 0;

  return (
    <Panel
      flat
      className="enter"
      title="Arkadaşlar"
      subtitle={
        friends && friends.length > 0
          ? `${friends.length} arkadaş, ${onlineCount} çevrimiçi. Çevrimdışı olanlar da burada görünür.`
          : "Oyunda eklediğin arkadaşların burada görünür, çevrimdışı olanlar da."
      }
      action={
        <Button variant="secondary" disabled={loading} onClick={() => void load()} title="Listeyi yenile">
          <RefreshCw size={14} className={clsx(loading && "animate-spin")} />
          Yenile
        </Button>
      }
    >
      {error ? (
        <p className="text-[13px] leading-relaxed text-danger">{error}</p>
      ) : friends === null ? (
        <p className="text-[13px] text-ink-mute">Yükleniyor…</p>
      ) : friends.length === 0 ? (
        <div className="text-[13px] leading-relaxed text-ink-soft">
          <p>Henüz arkadaşın yok.</p>
          <p className="mt-1 text-ink-mute">
            Oyunda <code className="font-semibold text-ink">/arkadas ekle &lt;oyuncu&gt;</code> yaz;
            kabul edilince burada görünür.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {friends.map((friend, index) => (
            <FriendRow key={friend.name} friend={friend} index={index} now={now} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function FriendRow({ friend, index, now }: { friend: Friend; index: number; now: number }) {
  return (
    <li
      // Satirlar kisa araliklarla yerine oturuyor.
      style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
      className={clsx(
        "enter flex items-center gap-3 rounded-xl border p-3 transition-colors",
        friend.online ? "border-line bg-white hover:bg-hover" : "border-line-soft bg-card",
      )}
    >
      <div className="relative">
        <Head name={friend.name} size={40} />
        {/* Durum noktasi: yesil cevrimici, gri cevrimdisi. */}
        <span
          aria-hidden
          className={clsx(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
            friend.online ? "bg-[#22c55e]" : "bg-ink-faint",
          )}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            "truncate text-[13px] font-semibold",
            friend.online ? "text-ink" : "text-ink-soft",
          )}
        >
          {friend.name}
        </p>
        <p className="truncate text-[11px] font-medium text-ink-mute">
          {friend.online
            ? friend.server
              ? `${friend.server}'de`
              : "Çevrimiçi"
            : `Çevrimdışı · ${sinceText(friend.lastSeen, now)}`}
        </p>
      </div>
    </li>
  );
}
