use serde::{Serialize, Serializer};

/// Launcher genelinde kullanilan hata tipi.
/// Tauri komutlarindan donerken otomatik olarak string'e serialize edilir,
/// boylece frontend tarafinda `catch (e) { ... }` ile okunabilir hale gelir.
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("Ag hatasi: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Dosya hatasi: {0}")]
    Io(#[from] std::io::Error),

    #[error("Gecersiz JSON: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Arsiv acilamadi: {0}")]
    Zip(#[from] zip::result::ZipError),

    #[error("Tauri hatasi: {0}")]
    Tauri(#[from] tauri::Error),

    #[error("{0}")]
    Msg(String),
}

impl Error {
    pub fn msg(m: impl Into<String>) -> Self {
        Error::Msg(m.into())
    }
}

impl Serialize for Error {
    fn serialize<S: Serializer>(&self, s: S) -> std::result::Result<S::Ok, S::Error> {
        s.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, Error>;

/// `Option` -> `Result` kisayolu: eksik alanlari anlamli mesajla raporlar.
pub trait OptionExt<T> {
    fn or_err(self, m: &str) -> Result<T>;
}

impl<T> OptionExt<T> for Option<T> {
    fn or_err(self, m: &str) -> Result<T> {
        self.ok_or_else(|| Error::Msg(m.to_string()))
    }
}
