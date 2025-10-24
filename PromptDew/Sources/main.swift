import AppKit
import Carbon.HIToolbox

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem?
    private var preferencesWindow: PreferencesWindowController?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        buildStatusMenu()
        NSApp.activate(ignoringOtherApps: true)

        // Rebuild on snippet updates
        NotificationCenter.default.addObserver(self, selector: #selector(rebuildStatusMenu),
                                               name: SnippetStore.snippetsChangedNotification, object: nil)
    }

    private func buildStatusMenu() {
        let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let btn = item.button {
            btn.title = "🫧"
            btn.toolTip = "PromptDew"
        }
        item.menu = makeMenu()
        statusItem = item
    }

    private func makeMenu() -> NSMenu {
        let menu = NSMenu()
        menu.autoenablesItems = false

        let accessibilityItem = NSMenuItem(title: "Request Accessibility…",
                                           action: #selector(requestAccessibility),
                                           keyEquivalent: "")
        accessibilityItem.target = self
        accessibilityItem.isEnabled = true
        menu.addItem(accessibilityItem)

        menu.addItem(NSMenuItem.separator())

        // Dynamic snippet items
        let snippets = SnippetStore.shared.load()
        if snippets.isEmpty {
            let empty = NSMenuItem(title: "No snippets (open Preferences…)", action: nil, keyEquivalent: "")
            empty.isEnabled = false
            menu.addItem(empty)
        } else {
            for snippet in snippets {
                let title = "Insert: " + snippet.title
                let item = NSMenuItem(title: title, action: #selector(insertSnippet(_:)), keyEquivalent: "")
                item.representedObject = snippet.text
                item.target = self
                item.isEnabled = true
                menu.addItem(item)
            }
        }

        menu.addItem(NSMenuItem.separator())

        let prefsItem = NSMenuItem(title: "Preferences…", action: #selector(openPreferences), keyEquivalent: ",")
        prefsItem.target = self
        prefsItem.isEnabled = true
        menu.addItem(prefsItem)

        let quitItem = NSMenuItem(title: "Quit", action: #selector(quitApp), keyEquivalent: "q")
        quitItem.target = self
        quitItem.isEnabled = true
        menu.addItem(quitItem)

        return menu
    }

    @objc private func rebuildStatusMenu() {
        statusItem?.menu = makeMenu()
    }

    @objc private func requestAccessibility() {
        let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
        _ = AXIsProcessTrustedWithOptions(options)
    }

    @objc private func insertSnippet(_ sender: NSMenuItem) {
        guard AXIsProcessTrusted() else {
            requestAccessibility()
            return
        }
        guard let text = sender.representedObject as? String else { return }
        KeyTyper.type(text: text)
    }

    @objc private func openPreferences() {
        if preferencesWindow == nil {
            preferencesWindow = PreferencesWindowController()
        }
        preferencesWindow?.show()
        NSApp.activate(ignoringOtherApps: true)
    }

    @objc private func quitApp() {
        NSApp.terminate(nil)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
