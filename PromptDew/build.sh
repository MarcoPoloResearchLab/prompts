#!/usr/bin/env bash
set -euo pipefail

app_name="PromptDew"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
build_dir="${script_dir}/build"
app_dir="${build_dir}/${app_name}.app"
macos_dir="${app_dir}/Contents/MacOS"
contents_dir="${app_dir}/Contents"
sign_identity="${PROMPTDEW_SIGN_IDENTITY:-PromptDew Dev}"
default_keychain="$(security default-keychain | tr -d '\"[:space:]')"
if [[ -z "${default_keychain}" || ! -f "${default_keychain}" ]]; then
    default_keychain="${HOME}/Library/Keychains/login.keychain-db"
fi

ensure_signing_identity() {
    if security find-identity -v -p codesigning "${default_keychain}" 2>/dev/null | grep -Fq "${sign_identity}"; then
        return
    fi

    echo "Creating local code-signing identity '${sign_identity}'..."
    tmp_dir="$(mktemp -d)"
    cat > "${tmp_dir}/openssl.cnf" <<EOF
[ req ]
default_bits = 2048
distinguished_name = req_distinguished_name
x509_extensions = codesign_ext
prompt = no

[ req_distinguished_name ]
CN = ${sign_identity}

[ codesign_ext ]
keyUsage = digitalSignature
extendedKeyUsage = codeSigning
EOF

    openssl req -new -x509 -newkey rsa:2048 -nodes \
        -keyout "${tmp_dir}/promptdew.key" \
        -out "${tmp_dir}/promptdew.cer" \
        -days 3650 \
        -config "${tmp_dir}/openssl.cnf" >/dev/null 2>&1

    openssl pkcs12 -export \
        -inkey "${tmp_dir}/promptdew.key" \
        -in "${tmp_dir}/promptdew.cer" \
        -out "${tmp_dir}/promptdew.p12" \
        -passout pass:promptdew >/dev/null 2>&1

    security import "${tmp_dir}/promptdew.p12" -k "${default_keychain}" -P promptdew -T /usr/bin/codesign >/dev/null

    security add-trusted-cert -d -k "${default_keychain}" "${tmp_dir}/promptdew.cer" >/dev/null 2>&1 || true
    rm -rf "${tmp_dir}"
}

rm -rf "${build_dir}"
mkdir -p "${macos_dir}" "${contents_dir}"

echo "Compiling…"
swiftc -O -swift-version 5 -framework AppKit -framework Carbon   "${script_dir}/Sources/main.swift"   "${script_dir}/Sources/SnippetStore.swift"   "${script_dir}/Sources/PreferencesWindow.swift"   "${script_dir}/Sources/AccessibilityService.swift"   "${script_dir}/Sources/KeyTyper.swift"   -o "${macos_dir}/${app_name}"

cp "${script_dir}/Info.plist" "${contents_dir}/Info.plist"

ensure_signing_identity
echo "Signing with identity '${sign_identity}'…"
codesign --force --deep --sign "${sign_identity}" "${app_dir}"

echo "Built: ${app_dir}"
open "${app_dir}"
