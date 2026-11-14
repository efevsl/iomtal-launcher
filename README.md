<p align="center">
  <img src="src/assets/iomtal-logo.png" alt="IOMTAL SMP" width="120" />
</p>

<h1 align="center">IOMTAL SMP Launcher</h1>

<p align="center">
  IOMTAL SMP sunucusunun resmi Minecraft launcher'ı. Tek tuşla kur, tek tuşla oyna.
</p>

<p align="center">
  <a href="https://github.com/efevsl/iomtal-launcher/releases/latest/download/IOMTAL-Launcher-Setup.exe">
    <img src="https://img.shields.io/badge/İNDİR-Windows%20(x64)-c40c0c?style=for-the-badge&logo=windows&logoColor=white" alt="İndir" />
  </a>
</p>

<p align="center">
  <a href="https://github.com/efevsl/iomtal-launcher/releases/latest">Tüm sürümler</a> ·
  <a href="https://www.iomtalsmp.com">iomtalsmp.com</a>
</p>

---

## Kurulum

1. Yukarıdaki **İNDİR** düğmesine bas, `IOMTAL-Launcher-Setup.exe` inecek.
2. Dosyayı çalıştır ve kurulumu tamamla. Yönetici izni gerekmez.
3. Launcher'ı aç, **iomtalsmp.com** hesabınla giriş yap ve **Oyna**'ya bas.

Minecraft, Fabric, modlar ve gereken Java sürümü ilk açılışta kendiliğinden
kurulur. Ayrıca bir şey indirmene gerek yok.

> **"Windows bilgisayarınızı korudu" uyarısı çıkarsa:** **Ek bilgi** →
> **Yine de çalıştır**'a bas. Launcher henüz kod imzalı olmadığı için Windows
> bu uyarıyı gösteriyor.

## Özellikler

- **Tek tuşla oyna:** Doğru Minecraft sürümü ve Fabric otomatik kurulur, oyun
  doğrudan sunucuya bağlanır.
- **Otomatik mod güncellemesi:** Sunucunun mod paketi değiştiğinde launcher
  kendini eşitler. Kendi eklediğin modlara dokunmaz.
- **Java derdi yok:** Gereken Java sistemde yoksa launcher indirip kurar.
- **Sunucu durumu:** Sunucunun açık olup olmadığı ve kaç kişinin oynadığı ana
  ekranda görünür.
- **Arkadaşlar:** Arkadaşlarının çevrimiçi durumunu launcher'dan gör.
- **Canlı konsol:** Oyun çıktısı launcher içinde akar; bir sorun olursa
  hemen görürsün.

## Sistem gereksinimleri

| | |
| --- | --- |
| İşletim sistemi | Windows 10 / 11 (64 bit) |
| WebView2 | Windows 11'de hazır gelir; Windows 10'da kurulum sırasında eklenir |
| İnternet | İlk kurulumda Minecraft ve modlar indirilir |

## Kaynak kodu hakkında

Bu depoda launcher'ın yalnızca **arayüz** kodu (React + Tailwind) ve birkaç
yardımcı dosya bulunur. Launcher çekirdeği (giriş, kurulum, mod eşitleme, oyunu
başlatma), istemci modu ve sunucu eklentileri **kapalı kaynaktır** ve bu depoda
yer almaz. Bu yüzden depo tek başına derlenemez; oynamak için
[Releases](https://github.com/efevsl/iomtal-launcher/releases) sayfasındaki
kurulum dosyasını kullan.

## Lisans

© 2026 Efe Emre KAYA. Tüm hakları saklıdır. Kodun kopyalanması, değiştirilmesi
veya dağıtılması yasaktır; ayrıntılar için [LICENSE](LICENSE) dosyasına bak.
