// Librería principal de Red Salud Desktop
use tauri::Manager;

// Re-exportar el main run
pub use crate::main::run;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    main()
}
