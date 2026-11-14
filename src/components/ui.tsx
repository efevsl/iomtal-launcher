import clsx from "clsx";
import { AlertTriangle, Info } from "lucide-react";
import type { CSSProperties, ReactNode, InputHTMLAttributes } from "react";

/*
 * Paylasilan arayuz parcalari.
 *
 * Tasarim kurallari:
 *  - Beyaz kart, ince gri cizgi, 14-16 piksel yuvarlatma.
 *  - Golge yalnizca hareket halindeyken (hover, acilir menu).
 *  - Dolu kirmizi sadece eylemde: birincil dugme, aktif menu, ilerleme.
 */

// ------------------------------------------------------------------ Button

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  className?: string;
  title?: string;
  type?: "button" | "submit";
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hot",
  secondary: "bg-white text-ink border border-line hover:bg-hover",
  ghost: "text-ink-soft hover:bg-hover hover:text-ink",
  danger: "bg-danger-tint text-danger border border-danger-line hover:bg-[#fde4e4]",
};

export function Button({
  children,
  onClick,
  variant = "secondary",
  disabled,
  className,
  title,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "clickbox inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5",
        "text-[13px] font-semibold",
        "disabled:cursor-not-allowed disabled:opacity-45",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ------------------------------------------------------------------- Panel

/**
 * Icerik karti.
 *
 * Baslik varsa ince bir cizgiyle govdeden ayriliyor. Kart hoverda bir
 * tik yukseliyor.
 */
export function Panel({
  children,
  className,
  style,
  title,
  subtitle,
  action,
  flat,
}: {
  children?: ReactNode;
  className?: string;
  /** Acilis dizisindeki sirasini vermek icin: animationDelay. */
  style?: CSSProperties;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  /** Hoverda yukselmesin - icinde surekli degisen bir sey varsa. */
  flat?: boolean;
}) {
  return (
    <section
      style={style}
      className={clsx(
        "rounded-2xl border border-line bg-card",
        !flat && "lift",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line-soft px-5 py-4">
          <div>
            {title && <h2 className="text-[15px] font-bold text-ink">{title}</h2>}
            {subtitle && (
              <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-ink-soft">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

// ------------------------------------------------------------------- Field

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-ink-mute">{hint}</span>}
    </label>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink",
        "placeholder:text-ink-faint outline-none transition-colors",
        "focus:border-brand",
        className,
      )}
    />
  );
}

// ------------------------------------------------------------------ Toggle

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left"
    >
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-soft">{hint}</span>}
      </span>
      {/* Hap anahtar: topuz acikken buyuyup saga kayiyor. */}
      <span
        className={clsx(
          "relative h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200",
          checked ? "border-brand bg-brand" : "border-line bg-hover",
        )}
      >
        <span
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-200",
            checked
              ? "left-[22px] h-4 w-4 bg-white"
              : "left-[4px] h-3 w-3 bg-ink-faint",
          )}
        />
      </span>
    </button>
  );
}

// ------------------------------------------------------------------- Chip

/** Durum rozeti - tonlu zemin, yuvarlak. */
export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "ok" | "warn";
  children: ReactNode;
}) {
  const styles = {
    neutral: "bg-hover text-ink-soft",
    ok: "bg-ok-tint text-ok",
    warn: "bg-warn-tint text-warn",
  }[tone];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold",
        styles,
      )}
    >
      {children}
    </span>
  );
}

// ------------------------------------------------------------------ Notice

/**
 * Uyari kutusu.
 *
 * Marka rengi de kirmizi oldugu icin hatayi renkten degil bicimden
 * tanimak gerekiyor: tonlu zemin, cerceve ve her zaman bir ikon.
 * Dolu kirmizi bir dugmeyle karistirilmasi mumkun degil.
 */
export function Notice({
  tone,
  children,
  onDismiss,
}: {
  tone: "error" | "info" | "warn";
  children: ReactNode;
  onDismiss?: () => void;
}) {
  const skin = {
    error: "bg-danger-tint border-danger-line text-danger",
    warn: "bg-warn-tint border-[#fde68a] text-warn",
    info: "bg-hover border-line text-ink-soft",
  }[tone];

  const Icon = tone === "info" ? Info : AlertTriangle;

  return (
    <div className={clsx("flex items-start gap-3 rounded-xl border px-4 py-3", skin)}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="selectable flex-1 text-[13px] leading-relaxed">{children}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="-mr-1 shrink-0 cursor-pointer rounded-lg px-1.5 text-lg leading-none opacity-60 transition-opacity hover:opacity-100"
          aria-label="Kapat"
        >
          &times;
        </button>
      )}
    </div>
  );
}
