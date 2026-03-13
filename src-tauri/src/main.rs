#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod commands;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
            let db_path = app_dir.join("salary.db");
            db::init_db(&db_path).expect("Failed to initialize database");
            app.manage(db::DbState { path: db_path });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_employees,
            commands::add_employee,
            commands::update_employee,
            commands::delete_employee,
            commands::calculate_salary,
            commands::batch_calculate_salary,
            commands::save_attendance,
            commands::get_attendances,
            commands::batch_import_employees,
            commands::batch_import_attendances,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
