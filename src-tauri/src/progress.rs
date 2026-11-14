//! Kurulum/indirme ilerlemesinin frontend'e bildirilmesi.

use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};

use serde::Serialize;
use tauri::{AppHandle, Emitter, Runtime};

pub const PROGRESS_EVENT: &str = "launcher://progress";

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Progress {
    /// Makine tarafindan okunan asama anahtari: "manifest", "libraries", "assets", "mods"...
    pub stage: String,
    /// Kullaniciya gosterilecek metin.
    pub message: String,
    pub current: u64,
    pub total: u64,
    pub done: bool,
}

pub fn emit<R: Runtime>(app: &AppHandle<R>, stage: &str, message: impl Into<String>, current: u64, total: u64) {
    let _ = app.emit(
        PROGRESS_EVENT,
        Progress {
            stage: stage.to_string(),
            message: message.into(),
            current,
            total,
            done: false,
        },
    );
}

pub fn emit_done<R: Runtime>(app: &AppHandle<R>, stage: &str, message: impl Into<String>) {
    let _ = app.emit(
        PROGRESS_EVENT,
        Progress {
            stage: stage.to_string(),
            message: message.into(),
            current: 1,
            total: 1,
            done: true,
        },
    );
}

/// Cok sayida es zamanli indirme icin akis kontrollu ilerleme sayaci.
///
/// Varlik (asset) indirmeleri binlerce dosya olabiliyor; her dosyada olay
/// yayinlamak IPC'yi bogar. Bu sayac en fazla ~20 Hz hizinda olay uretir.
pub struct Throttle {
    done: AtomicU64,
    total: u64,
    last_emit: parking_lot_lite::Mutex<Instant>,
    stage: String,
    label: String,
}

impl Throttle {
    pub fn new(stage: &str, label: &str, total: u64) -> Self {
        Self {
            done: AtomicU64::new(0),
            total,
            last_emit: parking_lot_lite::Mutex::new(Instant::now() - Duration::from_secs(1)),
            stage: stage.to_string(),
            label: label.to_string(),
        }
    }

    /// Bir birim ilerleme kaydeder ve gerekiyorsa olay yayinlar.
    pub fn tick<R: Runtime>(&self, app: &AppHandle<R>) {
        let current = self.done.fetch_add(1, Ordering::Relaxed) + 1;
        let is_last = current >= self.total;

        {
            let mut last = self.last_emit.lock();
            if !is_last && last.elapsed() < Duration::from_millis(50) {
                return;
            }
            *last = Instant::now();
        }

        emit(
            app,
            &self.stage,
            format!("{} ({current}/{})", self.label, self.total),
            current,
            self.total,
        );
    }
}

/// `std::sync::Mutex` uzerine ince bir sarmalayici: kilit zehirlenmesini
/// yok sayar, cunku burada tutulan tek sey bir zaman damgasi.
mod parking_lot_lite {
    pub struct Mutex<T>(std::sync::Mutex<T>);

    impl<T> Mutex<T> {
        pub fn new(value: T) -> Self {
            Self(std::sync::Mutex::new(value))
        }
        pub fn lock(&self) -> std::sync::MutexGuard<'_, T> {
            self.0.lock().unwrap_or_else(|e| e.into_inner())
        }
    }
}
