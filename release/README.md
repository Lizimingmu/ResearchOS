# ResearchOS Windows releases

The versioned NSIS installers and standalone executables are copied here from verified Tauri release builds. Verify files
against `SHA256SUMS.txt` before distribution. These builds are unsigned; Windows may show a SmartScreen warning.

The current release candidate is v0.12.0 (`v0.12.0-rc1`) with a Simplified Chinese interface, the Research Problem Atlas (科研常见问题库), the
Chinese first-run tutorial, and the M015 Personal Content Studio (内容工作台): versioned personal overlays, review packs,
patch/history/rollback, and explicit curated Obsidian publishing/review batches. Chinese release notes:
`RELEASE_NOTES_v0.12.0.md`. This directory keeps only the current candidate binaries; older binaries were removed from the
working copy and remain historically traceable through Git metadata, release records, and `CHANGELOG.md`.
Reproducible version, toolchain, schema, size, and digest information is recorded in `BUILD_METADATA_v0.12.0.json`.
Background gates passed; packaged-app foreground, installer and user-manual checks remain explicitly NOT RUN.
