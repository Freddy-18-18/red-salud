// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::Manager;
use tauri::Emitter;
use std::fs;
use serde::{Deserialize, Serialize};

// Eliminamos mod commands; y pegamos el código aquí para evitar errores de macros

fn main() {
    // Cargar variables de entorno desde .env
    dotenv::dotenv().ok();

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            let handle = app.handle();

            // --- MENU CREATION ---
            let menu = Menu::new(handle)?;

            let file_menu = Submenu::new(handle, "Archivo", true)?;
            let settings = MenuItem::with_id(handle, "settings", "Configuración", true, None::<&str>)?;
            let quit = MenuItem::with_id(handle, "quit", "Salir", true, None::<&str>)?;
            file_menu.append(&settings)?;
            file_menu.append(&PredefinedMenuItem::separator(handle)?)?;
            file_menu.append(&quit)?;

            let view_menu = Submenu::new(handle, "Vista", true)?;
            let reload = MenuItem::with_id(handle, "reload", "Recargar", true, None::<&str>)?;
            let toggle_fullscreen = MenuItem::with_id(handle, "toggle-fullscreen", "Alternar Pantalla Completa", true, None::<&str>)?;
            view_menu.append(&reload)?;
            view_menu.append(&toggle_fullscreen)?;

            menu.append(&file_menu)?;
            menu.append(&view_menu)?;

            app.set_menu(menu)?;

            // --- SPLASHSCREEN LOGIC ---
            let splashscreen_window = app.get_webview_window("splashscreen");
            let main_window = app.get_webview_window("main");

            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(2));
                if let Some(splash) = splashscreen_window {
                    let _ = splash.close();
                }
                if let Some(main) = main_window {
                    let _ = main.show();
                    let _ = main.set_focus();
                }
            });

            Ok(())
        })
        .on_menu_event(|app, event| {
            // Fix: event.id() returns MenuId, use internal string or as_ref
            let id_str = event.id().0.as_str(); 
            match id_str {
                "settings" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("navigate", "/dashboard/medico/configuracion");
                    }
                }
                "quit" => {
                    std::process::exit(0);
                }
                "reload" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.emit("reload", ()); 
                    }
                }
                "toggle-fullscreen" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.set_fullscreen(!window.is_fullscreen().unwrap_or(false));
                    }
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_offline_data,
            save_offline_data,
            delete_offline_data,
            clear_offline_data,
            get_offline_keys,
            check_connectivity,
            minimize_window,
            maximize_window,
            close_window,
            get_supabase_config,
            supabase_get,
            supabase_post,
            supabase_patch,
            supabase_delete,
            save_file_locally,
            open_file,
            read_file_locally,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ============================================
// COMMANDS (Merged from commands.rs)
// ============================================

/// Obtiene datos almacenados offline
#[tauri::command]
async fn get_offline_data(app_handle: tauri::AppHandle, key: String) -> Result<Option<String>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let data_path = app_dir
        .join("offline_data")
        .join(format!("{}.json", key));

    if data_path.exists() {
        fs::read_to_string(data_path)
            .map(Some)
            .map_err(|e| e.to_string())
    } else {
        Ok(None)
    }
}

/// Guarda datos para uso offline
#[tauri::command]
async fn save_offline_data(
    app_handle: tauri::AppHandle,
    key: String,
    data: String,
) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let offline_dir = app_dir.join("offline_data");

    // Crear directorio si no existe
    fs::create_dir_all(&offline_dir).map_err(|e| e.to_string())?;

    let data_path = offline_dir.join(format!("{}.json", key));
    fs::write(data_path, data).map_err(|e| e.to_string())
}

/// Elimina datos almacenados offline
#[tauri::command]
async fn delete_offline_data(app_handle: tauri::AppHandle, key: String) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let data_path = app_dir
        .join("offline_data")
        .join(format!("{}.json", key));

    if data_path.exists() {
        fs::remove_file(data_path).map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

/// Limpia todos los datos almacenados offline
#[tauri::command]
async fn clear_offline_data(app_handle: tauri::AppHandle) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let offline_dir = app_dir.join("offline_data");

    if offline_dir.exists() {
        fs::remove_dir_all(&offline_dir).map_err(|e| e.to_string())?;
        // Recrear el directorio vacío
        fs::create_dir_all(&offline_dir).map_err(|e| e.to_string())?;
    }

    Ok(())
}

/// Obtiene todas las claves de datos almacenados offline
#[tauri::command]
async fn get_offline_keys(app_handle: tauri::AppHandle) -> Result<Vec<String>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let offline_dir = app_dir.join("offline_data");

    if !offline_dir.exists() {
        return Ok(Vec::new());
    }

    let entries = fs::read_dir(offline_dir).map_err(|e| e.to_string())?;

    let keys: Vec<String> = entries
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                let path = e.path();
                if path.extension()? == "json" {
                    path.file_stem()?.to_str().map(|s| s.to_string())
                } else {
                    None
                }
            })
        })
        .collect();

    Ok(keys)
}

/// Verifica la conectividad a internet
#[tauri::command]
async fn check_connectivity() -> Result<bool, String> {
    // Intentar hacer ping a un servidor confiable
    match reqwest::get("https://www.google.com").await {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

/// Minimiza la ventana principal
#[tauri::command]
async fn minimize_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.minimize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Maximiza o restaura la ventana principal
#[tauri::command]
async fn maximize_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.maximize().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Cierra la ventana principal
#[tauri::command]
async fn close_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ============================================
// SUPABASE INTEGRATION
// ============================================

#[derive(Serialize, Deserialize)]
struct SupabaseConfig {
    url: String,
    anon_key: String,
}

/// Obtiene la configuración de Supabase desde variables de entorno
#[tauri::command]
async fn get_supabase_config() -> Result<SupabaseConfig, String> {
    Ok(SupabaseConfig {
        url: std::env::var("NEXT_PUBLIC_SUPABASE_URL")
            .unwrap_or_else(|_| "https://hwckkfiirldgundbcjsp.supabase.co".to_string()),
        anon_key: std::env::var("NEXT_PUBLIC_SUPABASE_ANON_KEY")
            .unwrap_or_else(|_| "".to_string()),
    })
}

// ============================================
// API PROXY COMMANDS
// ============================================

/// Hace una petición GET a Supabase
#[tauri::command]
async fn supabase_get(
    app_handle: tauri::AppHandle,
    endpoint: String,
    access_token: String,
    cache_key: Option<String>,
) -> Result<String, String> {
    // Intentar obtener de caché primero si se proporciona cache_key
    if let Some(key) = &cache_key {
        if let Ok(Some(cached)) = get_offline_data(app_handle.clone(), key.clone()).await {
            return Ok(cached);
        }
    }

    // Si no hay caché, hacer request a Supabase
    let config = get_supabase_config().await?;
    let client = reqwest::Client::new();
    
    let response = client
        .get(format!("{}{}", config.url, endpoint))
        .header("apikey", &config.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let text = response.text().await.map_err(|e| e.to_string())?;

    // Guardar en caché si se proporciona cache_key
    if let Some(key) = cache_key {
        let _ = save_offline_data(app_handle, key, text.clone()).await;
    }

    Ok(text)
}

/// Hace una petición POST a Supabase
#[tauri::command]
async fn supabase_post(
    endpoint: String,
    body: String,
    access_token: String,
    #[allow(unused_variables)] app_handle: tauri::AppHandle, // Dummy handle if needed logic
) -> Result<String, String> {
    let config = get_supabase_config().await?;
    let client = reqwest::Client::new();
    
    let response = client
        .post(format!("{}{}", config.url, endpoint))
        .header("apikey", &config.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .body(body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    response.text().await.map_err(|e| e.to_string())
}

/// Hace una petición PATCH a Supabase
#[tauri::command]
async fn supabase_patch(
    endpoint: String,
    body: String,
    access_token: String,
) -> Result<String, String> {
    let config = get_supabase_config().await?;
    let client = reqwest::Client::new();
    
    let response = client
        .patch(format!("{}{}", config.url, endpoint))
        .header("apikey", &config.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .header("Content-Type", "application/json")
        .body(body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    response.text().await.map_err(|e| e.to_string())
}

/// Hace una petición DELETE a Supabase
#[tauri::command]
async fn supabase_delete(
    endpoint: String,
    access_token: String,
) -> Result<String, String> {
    let config = get_supabase_config().await?;
    let client = reqwest::Client::new();
    
    let response = client
        .delete(format!("{}{}", config.url, endpoint))
        .header("apikey", &config.anon_key)
        .header("Authorization", format!("Bearer {}", access_token))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    response.text().await.map_err(|e| e.to_string())
}

// ============================================
// FILE OPERATIONS
// ============================================

/// Guarda un archivo localmente
#[tauri::command]
async fn save_file_locally(
    app_handle: tauri::AppHandle,
    filename: String,
    data: Vec<u8>,
    subfolder: Option<String>,
) -> Result<String, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let file_dir = if let Some(sub) = subfolder {
        app_dir.join(sub)
    } else {
        app_dir.join("files")
    };
    
    fs::create_dir_all(&file_dir).map_err(|e| e.to_string())?;

    let file_path = file_dir.join(&filename);
    fs::write(&file_path, data).map_err(|e| e.to_string())?;

    Ok(file_path.to_string_lossy().to_string())
}

/// Abre un archivo con la aplicación predeterminada
#[tauri::command]
async fn open_file(path: String) -> Result<(), String> {
    open::that(path).map_err(|e| e.to_string())
}

/// Lee un archivo local
#[tauri::command]
async fn read_file_locally(
    app_handle: tauri::AppHandle,
    filename: String,
    subfolder: Option<String>,
) -> Result<Vec<u8>, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;

    let file_dir = if let Some(sub) = subfolder {
        app_dir.join(sub)
    } else {
        app_dir.join("files")
    };

    let file_path = file_dir.join(&filename);
    fs::read(file_path).map_err(|e| e.to_string())
}
