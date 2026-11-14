// Surum derlemesinde arkada konsol penceresi acilmasin.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    iomtal_launcher_lib::run()
}
