#!/usr/bin/env bash
set -euo pipefail

app_name="PromptDew"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
build_dir="${script_dir}/build"
app_dir="${build_dir}/${app_name}.app"
macos_dir="${app_dir}/Contents/MacOS"
contents_dir="${app_dir}/Contents"

rm -rf "${build_dir}"
mkdir -p "${macos_dir}" "${contents_dir}"

echo "Compiling…"
swiftc -O -swift-version 5 -framework AppKit -framework Carbon   "${script_dir}/Sources/main.swift"   "${script_dir}/Sources/SnippetStore.swift"   "${script_dir}/Sources/PreferencesWindow.swift"   "${script_dir}/Sources/Accessibility.swift"   "${script_dir}/Sources/KeyTyper.swift"   -o "${macos_dir}/${app_name}"

cp "${script_dir}/Info.plist" "${contents_dir}/Info.plist"

echo "Ad-hoc signing…"
codesign --force --deep --sign - "${app_dir}"

echo "Built: ${app_dir}"
open "${app_dir}"
