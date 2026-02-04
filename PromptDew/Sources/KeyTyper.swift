import AppKit
import Carbon.HIToolbox

protocol KeyEventPosting {
    func post(utf16Characters: inout [UniChar])
}

struct CGKeyEventPoster: KeyEventPosting {
    private let downFactory: () -> CGEvent?
    private let upFactory: () -> CGEvent?
    private let eventPoster: (CGEvent) -> Void

    init(downFactory: @escaping () -> CGEvent? = {
        CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true)
    }, upFactory: @escaping () -> CGEvent? = {
        CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false)
    }, eventPoster: @escaping (CGEvent) -> Void = { event in
        event.post(tap: .cghidEventTap)
    }) {
        self.downFactory = downFactory
        self.upFactory = upFactory
        self.eventPoster = eventPoster
    }

    func post(utf16Characters: inout [UniChar]) {
        guard let downEvent = downFactory(),
              let upEvent = upFactory() else {
            return
        }
        var down = utf16Characters
        downEvent.keyboardSetUnicodeString(stringLength: down.count, unicodeString: &down)
        eventPoster(downEvent)
        var up = utf16Characters
        upEvent.keyboardSetUnicodeString(stringLength: up.count, unicodeString: &up)
        eventPoster(upEvent)
    }
}

protocol KeyTyping {
    func type(text: String)
}

struct SystemKeyTyper: KeyTyping {
    static var posterFactory: () -> KeyEventPosting = { CGKeyEventPoster() }
    private let poster: KeyEventPosting

    init(poster: KeyEventPosting? = nil) {
        if let poster {
            self.poster = poster
        } else {
            self.poster = SystemKeyTyper.posterFactory()
        }
    }

    func type(text: String) {
        for scalar in text.unicodeScalars {
            var utf16Characters: [UniChar] = Array(String(scalar).utf16)
            poster.post(utf16Characters: &utf16Characters)
        }
    }
}
