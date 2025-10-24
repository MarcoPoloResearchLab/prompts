import AppKit

enum Accessibility {
    static func isTrusted() -> Bool { AXIsProcessTrusted() }

    @discardableResult
    static func isTrustedOrPrompt() -> Bool {
        if AXIsProcessTrusted() { return true }
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(options)
        return AXIsProcessTrusted()
    }
}
