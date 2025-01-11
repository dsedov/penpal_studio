// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn log_message(message: String) {
    println!("From frontend: {}", message);
}
#[tauri::command]
fn quit_app() {
    std::process::exit(0);
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![log_message, quit_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
