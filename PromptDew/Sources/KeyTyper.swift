import AppKit
import Carbon.HIToolbox

enum KeyTyper {
    static func type(text: String) {
        for scalar in text.unicodeScalars {
            var utf16: [UniChar] = Array(String(scalar).utf16)
            if let down = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true),
               let up = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false) {
                down.keyboardSetUnicodeString(stringLength: utf16.count, unicodeString: &utf16)
                down.post(tap: .cghidEventTap)
                up.keyboardSetUnicodeString(stringLength: utf16.count, unicodeString: &utf16)
                up.post(tap: .cghidEventTap)
            }
        }
    }
}
