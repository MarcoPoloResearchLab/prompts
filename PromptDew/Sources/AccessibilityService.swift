import AppKit

protocol AccessibilityProviding {
    func isTrusted() -> Bool
    @discardableResult
    func requestAccessWithPrompt() -> Bool
}

struct SystemAccessibilityService: AccessibilityProviding {
    private let trustedHandler: () -> Bool
    private let promptHandler: (CFDictionary) -> Bool

    init(isTrusted: @escaping () -> Bool = { AXIsProcessTrusted() },
         prompt: @escaping (CFDictionary) -> Bool = { AXIsProcessTrustedWithOptions($0) }) {
        self.trustedHandler = isTrusted
        self.promptHandler = prompt
    }

    func isTrusted() -> Bool { trustedHandler() }

    @discardableResult
    func requestAccessWithPrompt() -> Bool {
        if trustedHandler() { return true }
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = promptHandler(options)
        return trustedHandler()
    }
}
