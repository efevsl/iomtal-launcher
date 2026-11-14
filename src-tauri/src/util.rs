//! Kucuk isletim sistemi yardimcilari.

use std::path::Path;
use std::process::Command;

use crate::error::{Error, Result};

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

/// Adresi kullanicinin varsayilan tarayicisinda acar.
pub fn open_url(url: &str) -> Result<()> {
    // Yalnizca web adreslerine izin ver: manifest gibi uzak kaynaklardan
    // gelen bir deger buraya duserse `file://` ya da baska bir sema ile
    // yerel program calistirilmasini engelliyoruz.
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err(Error::msg("Yalnizca http(s) adresleri acilabilir"));
    }

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        Command::new("rundll32")
            .args(["url.dll,FileProtocolHandler", url])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open").arg(url).spawn()?;
    }
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        Command::new("xdg-open").arg(url).spawn()?;
    }

    Ok(())
}

/// Klasoru sistem dosya yoneticisinde acar.
pub fn open_folder(path: &Path) -> Result<()> {
    if !path.exists() {
        std::fs::create_dir_all(path)?;
    }

    #[cfg(windows)]
    {
        // explorer.exe grafik bir uygulama; konsol penceresi acmiyor.
        Command::new("explorer").arg(path).spawn()?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open").arg(path).spawn()?;
    }
    #[cfg(all(unix, not(target_os = "macos")))]
    {
        Command::new("xdg-open").arg(path).spawn()?;
    }

    Ok(())
}

/// Sistemdeki toplam bellek (MB).
pub fn total_memory_mb() -> u64 {
    let mut system = sysinfo::System::new();
    system.refresh_memory();
    system.total_memory() / 1024 / 1024
}
