import { useState } from "react";
import clsx from "clsx";
import { Check, ExternalLink, LogIn, Trash2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { api } from "../lib/api";
import { useLauncher } from "../store/launcher";
import type { AccountView as Account } from "../lib/types";
import { Button, Panel, Field, TextInput } from "./ui";

const SITE_URL = "https://www.iomtalsmp.com";

export function AccountsView() {
  const { accounts, activeAccountId, busy } = useLauncher(
    useShallow((s) => ({
      accounts: s.accounts,
      activeAccountId: s.activeAccountId,
      busy: s.busy,
    })),
  );

  const loginSite = useLauncher((s) => s.loginSite);
  const selectAccount = useLauncher((s) => s.selectAccount);
  const removeAccount = useLauncher((s) => s.removeAccount);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = !busy && username.trim().length > 0 && password.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    loginSite(username.trim(), password);
    // Sifreyi formda birakmiyoruz; giris basarisiz olsa da tekrar yazilir.
    setPassword("");
  };

  return (
    <div className="space-y-4">
      <Panel
        className="enter"
        title="IOMTAL hesabıyla giriş"
        subtitle="Sunucuda kullandığın kullanıcı adı ve şifre. Site ve oyun aynı hesabı paylaşır."
      >
        <div className="max-w-sm space-y-3.5">
          <Field label="Kullanıcı adı">
            <TextInput
              value={username}
              placeholder="Nick"
              maxLength={16}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>

          <Field label="Şifre">
            <TextInput
              type="password"
              value={password}
              placeholder="••••••••"
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>

          <div className="flex items-center gap-4 pt-1">
            <Button variant="primary" disabled={!canSubmit} onClick={submit}>
              <LogIn size={15} />
              Giriş yap
            </Button>

            <button
              onClick={() => api.openExternal(`${SITE_URL}/kayit`)}
              className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-semibold text-ink-soft transition-colors hover:text-brand"
            >
              Hesabın yok mu? Kayıt ol
              <ExternalLink size={12} />
            </button>
          </div>
        </div>

        <p className="mt-5 border-t border-line-soft pt-4 text-[12px] leading-relaxed text-ink-mute">
          Şifren bu bilgisayarda saklanmaz. Giriş sonrası verilen süreli bir
          oturum anahtarı tutulur ve oyun her açılışta doğrulanır.
        </p>
      </Panel>

      {accounts.length > 0 && (
        <Panel
          className="enter"
          style={{ animationDelay: "60ms" }}
          title="Kayıtlı hesaplar"
          subtitle="Birden fazla hesapla girdiysen oynanacak olanı buradan seç."
        >
          <ul className="space-y-2">
            {accounts.map((account, index) => (
              <AccountRow
                key={account.id}
                account={account}
                index={index}
                active={account.id === activeAccountId}
                onSelect={() => selectAccount(account.id)}
                onRemove={() => removeAccount(account.id)}
              />
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function AccountRow({
  account,
  index,
  active,
  onSelect,
  onRemove,
}: {
  account: Account;
  index: number;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <li
      // Satirlar kisa araliklarla yerine oturuyor - liste bir anda
      // yapistirilmis gibi degil, siralanmis gibi geliyor.
      style={{ animationDelay: `${index * 45}ms` }}
      className={clsx(
        "enter flex items-center gap-3 rounded-xl border p-3 transition-colors",
        active
          ? "border-brand-tint bg-brand-tint"
          : "border-line bg-white hover:bg-hover",
      )}
    >
      <Avatar account={account} />

      <button onClick={onSelect} className="min-w-0 flex-1 cursor-pointer text-left">
        <p className="truncate text-[13px] font-semibold text-ink">{account.username}</p>
        <p className="text-[11px] font-medium text-ink-mute">{kindLabel(account)}</p>
      </button>

      {active && (
        <span className="flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-white">
          <Check size={12} strokeWidth={3} />
          Aktif
        </span>
      )}

      <button
        onClick={onRemove}
        aria-label={`${account.username} hesabını kaldır`}
        className="cursor-pointer rounded-lg p-2 text-ink-mute transition-colors hover:bg-danger-tint hover:text-danger"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

function kindLabel(account: Account): string {
  switch (account.kind) {
    case "site":
      return "IOMTAL hesabı";
    case "microsoft":
      return account.needsRefresh ? "Microsoft · oturum yenilenecek" : "Microsoft";
    default:
      return "Çevrimdışı";
  }
}

function Avatar({ account }: { account: Account }) {
  // Cevrimdisi UUID'ler cozulemedigi icin avatar kullanici adiyla isteniyor.
  const key = account.kind === "microsoft" ? account.id : account.username;

  return (
    <img
      src={`https://mc-heads.net/avatar/${encodeURIComponent(key)}/36`}
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 rounded-lg bg-hover"
      // Ag yoksa kirik gorsel simgesi gorunmesin.
      onError={(e) => (e.currentTarget.style.visibility = "hidden")}
    />
  );
}
