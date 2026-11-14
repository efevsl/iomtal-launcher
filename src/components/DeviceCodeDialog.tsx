import { useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2 } from "lucide-react";

import { api } from "../lib/api";
import { useLauncher } from "../store/launcher";
import { Button } from "./ui";

/**
 * Microsoft device-code akisinin kullanici tarafi: kod gosterilir, kullanici
 * tarayicida girer, launcher arka planda onayi bekler.
 */
export function DeviceCodeDialog() {
  const prompt = useLauncher((s) => s.devicePrompt);
  const [copied, setCopied] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!prompt) return;
    setRemaining(prompt.expiresIn);

    const timer = setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [prompt]);

  if (!prompt) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = String(remaining % 60).padStart(2, "0");

  const copy = async () => {
    await navigator.clipboard.writeText(prompt.userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className="enter w-[26rem] rounded-2xl border border-line bg-card p-6 shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
        <h2 className="text-[16px] font-bold text-ink">Microsoft ile giriş</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          Tarayıcında açılan sayfaya aşağıdaki kodu gir.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-page p-3">
          <code className="selectable flex-1 text-center font-mono text-2xl font-bold tracking-[0.3em] text-brand">
            {prompt.userCode}
          </code>
          <button
            onClick={copy}
            title="Kopyala"
            aria-label="Kodu kopyala"
            className="cursor-pointer rounded-lg p-2 text-ink-mute transition-colors hover:bg-hover hover:text-ink"
          >
            <Copy size={16} />
          </button>
        </div>

        {copied && (
          <p className="mt-2 text-center text-[12px] font-semibold text-ok">Kopyalandı</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => api.openExternal(prompt.verificationUri)}
          >
            <ExternalLink size={15} />
            Sayfayı aç
          </Button>
          <span className="tnum font-mono text-[12px] font-medium text-ink-mute">
            {minutes}:{seconds}
          </span>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-line-soft pt-4 text-[12px] text-ink-mute">
          <Loader2 size={13} className="animate-spin" />
          Onay bekleniyor…
        </div>
      </div>
    </div>
  );
}
