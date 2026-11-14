import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowDownToLine, Terminal, Trash2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useLauncher } from "../store/launcher";
import { Button } from "./ui";

/**
 * Oyunun cikti akisi.
 *
 * Okunan bir belge degil, izlenen bir aygit: ust seritte akisin canli
 * olup olmadigi, govdede satirlar. Hata satirlari sol kenarinda kirmizi
 * bir serit tasiyor - rengi secemeyen goz bile bicimden ayirt ediyor.
 */
export function ConsoleView() {
  const { logs, gameRunning } = useLauncher(
    useShallow((s) => ({ logs: s.logs, gameRunning: s.gameRunning })),
  );
  const clearLogs = useLauncher((s) => s.clearLogs);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [follow, setFollow] = useState(true);

  useEffect(() => {
    if (follow) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [logs, follow]);

  const errors = logs.reduce((n, log) => (log.stream === "stderr" ? n + 1 : n), 0);

  return (
    <div className="enter flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-card">
      {/* --- akis basligi --- */}
      <div className="flex items-center justify-between gap-4 border-b border-line-soft px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={clsx(
              "h-2 w-2 shrink-0 rounded-full",
              gameRunning ? "live bg-ok" : "bg-ink-faint",
            )}
          />
          <span className="text-[13px] font-bold text-ink">
            {gameRunning ? "Canlı" : "Beklemede"}
          </span>
          {logs.length > 0 && (
            <span className="tnum text-[12px] font-medium text-ink-mute">
              {logs.length} satır
              {errors > 0 && (
                <span className="font-bold text-danger"> · {errors} hata</span>
              )}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={follow ? "primary" : "ghost"}
            onClick={() => setFollow((v) => !v)}
            title="Yeni satırlara otomatik kaydır"
            className="!px-3 !py-2"
          >
            <ArrowDownToLine size={14} />
            Takip et
          </Button>
          <Button
            variant="ghost"
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="!px-3 !py-2"
          >
            <Trash2 size={14} />
            Temizle
          </Button>
        </div>
      </div>

      {/* --- akis govdesi --- */}
      <div
        // Kullanici elle yukari kaydirinca takibi kapat: log okurken
        // ekranin ziplamasi en can sikici davranistir.
        onWheel={(e) => e.deltaY < 0 && setFollow(false)}
        className="min-h-0 flex-1 overflow-auto bg-page"
      >
        {logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-hover text-ink-mute">
              <Terminal size={20} />
            </span>
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Oyun başlatıldığında çıktılar burada akar.
              <br />
              Bir sorun olursa aradığın satır bu ekranda olur.
            </p>
          </div>
        ) : (
          <pre className="selectable py-1 font-mono text-[11.5px] leading-relaxed">
            {logs.map((log, index) => {
              const isError = log.stream === "stderr";

              return (
                <div
                  key={index}
                  className={clsx(
                    "flex gap-3 whitespace-pre-wrap break-all py-px pr-3",
                    isError && "bg-danger-tint",
                  )}
                >
                  {/* Dolu serit: hata satiri renkten bagimsiz ayirt edilsin. */}
                  <span
                    aria-hidden
                    className={clsx(
                      "w-[3px] shrink-0 self-stretch",
                      isError ? "bg-danger" : "bg-transparent",
                    )}
                  />
                  <span className={isError ? "text-danger" : "text-ink-soft"}>
                    {log.line}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
