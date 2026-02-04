import AppKit
import Carbon.HIToolbox

protocol ApplicationControlling {
    @discardableResult
    func setActivationPolicy(_ policy: NSApplication.ActivationPolicy) -> Bool
    func activate(ignoringOtherApps flag: Bool)
    func terminate()
}

struct SystemApplicationController: ApplicationControlling {
    private let application: NSApplication
    private let terminator: () -> Void

    init(application: NSApplication = NSApplication.shared,
         terminator: (() -> Void)? = nil) {
        self.application = application
        if let terminator {
            self.terminator = terminator
        } else {
            self.terminator = { application.terminate(nil) }
        }
    }

    @discardableResult
    func setActivationPolicy(_ policy: NSApplication.ActivationPolicy) -> Bool {
        application.setActivationPolicy(policy)
    }

    func activate(ignoringOtherApps flag: Bool) {
        application.activate(ignoringOtherApps: flag)
    }

    func terminate() {
        terminator()
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private let snippetStore: SnippetStore
    private let accessibilityService: AccessibilityProviding
    private let keyTyper: KeyTyping
    private let notificationCenter: NotificationCenter
    private let statusItemFactory: () -> NSStatusItem
    private let application: ApplicationControlling
    private let preferencesFactory: (SnippetStore) -> PreferencesWindowController
    private var statusItem: NSStatusItem?
    private var preferencesWindow: PreferencesWindowController?

    init(snippetStore: SnippetStore = .shared,
         accessibilityService: AccessibilityProviding = SystemAccessibilityService(),
         keyTyper: KeyTyping = SystemKeyTyper(),
         notificationCenter: NotificationCenter = .default,
         statusItemFactory: @escaping () -> NSStatusItem = {
             NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
         },
         application: ApplicationControlling = SystemApplicationController(),
         preferencesFactory: @escaping (SnippetStore) -> PreferencesWindowController = {
             PreferencesWindowController(snippetStore: $0)
         }) {
        self.snippetStore = snippetStore
        self.accessibilityService = accessibilityService
        self.keyTyper = keyTyper
        self.notificationCenter = notificationCenter
        self.statusItemFactory = statusItemFactory
        self.application = application
        self.preferencesFactory = preferencesFactory
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        application.setActivationPolicy(.regular)
        buildStatusMenu()
        application.activate(ignoringOtherApps: true)

        notificationCenter.addObserver(self, selector: #selector(rebuildStatusMenu),
                                       name: SnippetStore.snippetsChangedNotification, object: nil)
    }

    func buildStatusMenu() {
        let item = statusItemFactory()
        if let btn = item.button {
            btn.title = "🫧"
            btn.toolTip = "PromptDew"
        }
        item.menu = makeMenu()
        statusItem = item
    }

    func makeMenu() -> NSMenu {
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
        let snippets = snippetStore.load()
        if snippets.isEmpty {
            let empty = NSMenuItem(title: "No snippets (open Preferences…)", action: nil, keyEquivalent: "")
            empty.isEnabled = false
            menu.addItem(empty)
        } else {
            for snippet in snippets {
                let item = NSMenuItem(title: snippet.title, action: #selector(insertSnippet(_:)), keyEquivalent: "")
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

    @objc func rebuildStatusMenu() {
        statusItem?.menu = makeMenu()
    }

    @objc func requestAccessibility() {
        _ = accessibilityService.requestAccessWithPrompt()
    }

    @objc func insertSnippet(_ sender: NSMenuItem) {
        guard accessibilityService.isTrusted() else {
            _ = accessibilityService.requestAccessWithPrompt()
            return
        }
        guard let text = sender.representedObject as? String else { return }
        keyTyper.type(text: text)
    }

    @objc func openPreferences() {
        if preferencesWindow == nil {
            preferencesWindow = preferencesFactory(snippetStore)
        }
        preferencesWindow?.show()
        application.activate(ignoringOtherApps: true)
    }

    @objc func quitApp() {
        application.terminate()
    }

    func currentMenu() -> NSMenu? { statusItem?.menu }
    func statusItemHandle() -> NSStatusItem? { statusItem }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
