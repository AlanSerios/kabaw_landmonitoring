# Implementation Plan: Initialize Android Project

## 1. Observation
- The target project directory `C:\Users\Alan Serios\teamwork_projects\kabaw_android` contains files (`.agents`, `ORIGINAL_REQUEST.md`, `PROJECT.md`, `TEST_INFRA.md`, `TEST_READY.md`).
- Running the Android CLI command `android create empty-activity --name="Kabaw AirMonitoring System" --output="C:\Users\Alan Serios\teamwork_projects\kabaw_android"` directly fails with: `ERROR: Cannot create template: Directory (or file) 'C:\Users\Alan Serios\teamwork_projects\kabaw_android' is not empty`.
- The Android CLI installation on Windows requires executing a batch file downloaded via `curl`.
- The `android-cli` SKILL.md specifies the Windows installation command: `curl.exe -fsSL https://dl.google.com/android/cli/latest/windows_x86_64/install.cmd -o "%TEMP%\i.cmd" && "%TEMP%\i.cmd"` (which needs adaptation for PowerShell, e.g., using `&`).

## 2. Logic Chain
1. To fulfill the requirement of initializing the Android project using the CLI in the current workspace, the Android CLI must first be installed if not already present.
2. Because the CLI strictly requires the destination directory to be empty, and the project root is not empty, the project cannot be created directly at the root.
3. Therefore, the implementation must create the project in a temporary subdirectory (e.g., `temp_init`), then move the generated files up to the project root, and finally clean up the temporary directory.

## 3. Caveats
- Moving files from the temporary directory to the root must carefully include all hidden files (like `.gitignore` or `.idea` if generated) and avoid overwriting existing non-Android files like `.agents` or documentation.
- The `android-cli` command requires the environment variable `PATH` to be updated or needs to be invoked with its absolute path (`$env:LOCALAPPDATA\AndroidCLI\android.exe`) immediately after installation.

## 4. Conclusion
The implementer should execute the following steps to initialize the project:
1. **Install Android CLI (PowerShell):** 
   ```powershell
   curl.exe -fsSL https://dl.google.com/android/cli/latest/windows_x86_64/install.cmd -o "$env:TEMP\i.cmd"; & "$env:TEMP\i.cmd"
   ```
2. **Create Project in Temp Folder:** 
   ```powershell
   & "$env:LOCALAPPDATA\AndroidCLI\android.exe" create empty-activity --name="Kabaw AirMonitoring System" --output="C:\Users\Alan Serios\teamwork_projects\kabaw_android\temp_init"
   ```
3. **Move Files to Root:** Move all contents from `temp_init` into `C:\Users\Alan Serios\teamwork_projects\kabaw_android`.
4. **Cleanup:** Delete the `temp_init` directory.

## 5. Verification Method
- **Command:** Run `.\gradlew tasks` (or `gradlew.bat tasks`) in the root directory to verify that the Android Gradle project is structurally valid.
- **File Inspection:** Confirm that `app/src/main/AndroidManifest.xml` and `build.gradle.kts` exist in the root directory structure and that the root also still contains `.agents/` and the original `*.md` files.
