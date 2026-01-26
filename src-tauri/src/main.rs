// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};

fn main() {
    // Cargar variables de entorno desde .env
    dotenv::dotenv().ok();

    // Crear el menú principal de la aplicación
    let main_menu = Menu::new();

    // Menú Archivo
    let file_menu = Submenu::new(
        "Archivo",
        true,
        Menu::new()
            .unwrap()
            .add_item(MenuItem::new(
                "Configuración",
                true,
                Some("settings"),
            ))
            .unwrap()
            .add_item(
                PredefinedMenuItem::separator(
                    None
                ).unwrap()
            )
            .unwrap()
            .add_item(MenuItem::new(
                "Salir",
                true,
                Some("quit"),
            ))
            .unwrap(),
    )
    .unwrap();

    // Menú Vista
    let view_menu = Submenu::new(
        "Vista",
        true,
        Menu::new()
            .unwrap()
            .add_item(MenuItem::new(
                "Recargar",
                true,
                Some("reload"),
            ))
            .unwrap()
            .add_item(MenuItem::new(
                "Alternar Pantalla Completa",
                true,
                Some("toggle-fullscreen"),
            ))
            .unwrap()
            .add_item(
                PredefinedMenuItem::separator(
                    None
                ).unwrap()
            )
            .unwrap()
            .add_item(MenuItem::new(
                "Minimizar",
                true,
                Some("minimize"),
            ))
            .unwrap()
            .add_item(MenuItem::new(
                "Maximizar",
                true,
                Some("maximize"),
            ))
            .unwrap(),
    )
    .unwrap();

    // Menú Herramientas
    let tools_menu = Submenu::new(
        "Herramientas",
        true,
        Menu::new()
            .unwrap()
            .add_item(MenuItem::new(
                "Developer Tools",
                true,
                Some("devtools"),
            ))
            .unwrap(),
    )
    .unwrap();

    // Menú Ayuda
    let help_menu = Submenu::new(
        "Ayuda",
        true,
        Menu::new()
            .unwrap()
            .add_item(MenuItem::new(
                "Documentación",
                true,
                Some("documentation"),
            ))
            .unwrap()
            .add_item(
                PredefinedMenuItem::separator(
                    None
                ).unwrap()
            )
            .unwrap()
            .add_item(MenuItem::new(
                "Acerca de Red Salud",
                true,
                Some("about"),
            ))
            .unwrap(),
    )
    .unwrap();

    // Combinar todos los menús
    let app_menu = main_menu
        .add_submenu(file_menu)
        .unwrap()
        .add_submenu(view_menu)
        .unwrap()
        .add_submenu(tools_menu)
        .unwrap()
        .add_submenu(help_menu)
        .unwrap();

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            // Mostrar splash screen al inicio
            let splashscreen_window = app.get_webview_window("splashscreen");
            let main_window = app.get_webview_window("main");

            // Esperar a que la ventana principal esté lista
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(2));

                // Cerrar splash screen
                if let Some(splash) = splashscreen_window {
                    let _ = splash.close();
                }

                // Mostrar ventana principal
                if let Some(main) = main_window {
                    let _ = main.show();
                    let _ = main.set_focus();
                }
            });

            // Registrar atajos globales de teclado
            let app_handle = app.handle().clone();
            let _ = app.global_shortcut().register("Ctrl+Shift+N", move || {
                if let Some(window) = app_handle.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.eval("window.location.href = '/dashboard/medico/citas/nueva'");
                }
            });

            // Ctrl+Shift+D - Dashboard
            let app_handle2 = app.handle().clone();
            let _ = app.global_shortcut().register("Ctrl+Shift+D", move || {
                if let Some(window) = app_handle2.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.eval("window.location.href = '/dashboard/medico'");
                }
            });

            // Ctrl+Shift+P - Pacientes
            let app_handle3 = app.handle().clone();
            let _ = app.global_shortcut().register("Ctrl+Shift+P", move || {
                if let Some(window) = app_handle3.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.eval("window.location.href = '/dashboard/medico/pacientes'");
                }
            });

            // Ctrl+Shift+M - Mensajería
            let app_handle4 = app.handle().clone();
            let _ = app.global_shortcut().register("Ctrl+Shift+M", move || {
                if let Some(window) = app_handle4.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = window.eval("window.location.href = '/dashboard/medico/mensajeria'");
                }
            });

            // Ctrl+Shift+Q - Salir (Quit)
            let _ = app.global_shortcut().register("Ctrl+Shift+Q", || {
                std::process::exit(0);
            });

            // F11 - Pantalla completa
            let app_handle6 = app.handle().clone();
            let _ = app.global_shortcut().register("F11", move || {
                if let Some(window) = app_handle6.get_webview_window("main") {
                    let _ = window.set_fullscreen(!window.is_fullscreen().unwrap_or(false));
                }
            });

            Ok(())
        })
        .menu(app_menu)
        .on_menu_event(|app, event| {
            match event.id().as_str() {
                "settings" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval("window.location.href = '/dashboard/medico/configuracion'");
                    }
                }
                "quit" => {
                    std::process::exit(0);
                }
                "reload" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval("window.location.reload()");
                    }
                }
                "toggle-fullscreen" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.set_fullscreen(!window.is_fullscreen().unwrap_or(false));
                    }
                }
                "minimize" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.minimize();
                    }
                }
                "maximize" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.maximize();
                    }
                }
                "devtools" => {
                    if let Some(window) = app.get_webview_window("main") {
                        window.open_devtools();
                    }
                }
                "documentation" => {
                    let _ = open::that("https://github.com/FreddLivve/red-salud");
                }
                "about" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.eval("alert('Red Salud Desktop v1.0.0\\n\\nSistema de gestión médica\\n\\n© 2026 Red Salud')");
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_offline_data,
            commands::save_offline_data,
            commands::delete_offline_data,
            commands::clear_offline_data,
            commands::get_offline_keys,
            commands::check_connectivity,
            commands::minimize_window,
            commands::maximize_window,
            commands::close_window,
            commands::get_supabase_config,
            commands::supabase_get,
            commands::supabase_post,
            commands::supabase_patch,
            commands::supabase_delete,
            commands::save_file_locally,
            commands::open_file,
            commands::read_file_locally,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    main();
}
