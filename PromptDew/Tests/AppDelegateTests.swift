import XCTest
@testable import PromptDew

@MainActor
final class AppDelegateTests: XCTestCase {
    func testMenuIncludesSnippetsAndActions() throws {
        let store = makeStore(with: [
            Snippet(title: "One", text: "First"),
            Snippet(title: "Two", text: "Second")
        ])
        let keyTyper = RecordingTyper()
        let accessibility = StubAccessibility(trusted: true)
        let delegate = AppDelegate(snippetStore: store,
                                   accessibilityService: accessibility,
                                   keyTyper: keyTyper,
                                   notificationCenter: NotificationCenter(),
                                   statusItemFactory: { NSStatusItem() })

        delegate.buildStatusMenu()
        let menu = delegate.currentMenu() ?? delegate.makeMenu()
        let items = menu.items.filter { $0.action == #selector(AppDelegate.insertSnippet(_:)) }

        XCTAssertEqual(items.map(\.title), ["One", "Two"])
    }

    func testInsertSnippetTypesOnlyWhenTrusted() throws {
        let store = makeStore(with: [
            Snippet(title: "One", text: "First")
        ])
        let keyTyper = RecordingTyper()
        let accessibility = StubAccessibility(trusted: false)
        let delegate = AppDelegate(snippetStore: store,
                                   accessibilityService: accessibility,
                                   keyTyper: keyTyper,
                                   notificationCenter: NotificationCenter(),
                                   statusItemFactory: { NSStatusItem() })
        let sender = NSMenuItem(title: "Test", action: nil, keyEquivalent: "")
        sender.representedObject = "Hello"

        delegate.insertSnippet(sender)
        XCTAssertTrue(accessibility.promptCalled)
        XCTAssertTrue(keyTyper.typedTexts.isEmpty)

        accessibility.trusted = true
        delegate.insertSnippet(sender)
        XCTAssertEqual(keyTyper.typedTexts, ["Hello"])
    }

    func testApplicationDidFinishLaunchingConfiguresApplication() {
        let store = makeStore(with: [])
        let app = TestApplicationController()
        let delegate = AppDelegate(snippetStore: store,
                                   accessibilityService: StubAccessibility(trusted: true),
                                   keyTyper: RecordingTyper(),
                                   notificationCenter: NotificationCenter(),
                                   statusItemFactory: { NSStatusItem() },
                                   application: app)

        delegate.applicationDidFinishLaunching(Notification(name: NSApplication.didFinishLaunchingNotification))

        XCTAssertEqual(app.activationPolicyChanges, [.regular])
        XCTAssertEqual(app.activationCount, 1)
    }

    func testRequestAccessibilityInvokesPrompt() {
        let accessibility = StubAccessibility(trusted: false)
        let delegate = AppDelegate(snippetStore: makeStore(with: []),
                                   accessibilityService: accessibility,
                                   keyTyper: RecordingTyper(),
                                   notificationCenter: NotificationCenter(),
                                   statusItemFactory: { NSStatusItem() })

        delegate.requestAccessibility()

        XCTAssertTrue(accessibility.promptCalled)
    }

    func testOpenPreferencesUsesFactoryAndActivatesApp() {
        let store = makeStore(with: [])
        let app = TestApplicationController()
        let preferences = StubPreferencesWindowController(snippetStore: store)
        let delegate = AppDelegate(snippetStore: store,
                                   accessibilityService: StubAccessibility(trusted: true),
                                   keyTyper: RecordingTyper(),
                                   notificationCenter: NotificationCenter(),
                                   statusItemFactory: { NSStatusItem() },
                                   application: app,
                                   preferencesFactory: { _ in preferences })

        delegate.openPreferences()

        XCTAssertEqual(preferences.showCount, 1)
        XCTAssertEqual(app.activationCount, 1)
    }

    func testQuitAppInvokesTerminator() {
        let app = TestApplicationController()
        let delegate = AppDelegate(snippetStore: makeStore(with: []),
                                   accessibilityService: StubAccessibility(trusted: true),
                                   keyTyper: RecordingTyper(),
                                   notificationCenter: NotificationCenter(),
                                   statusItemFactory: { NSStatusItem() },
                                   application: app)

        delegate.quitApp()

        XCTAssertEqual(app.terminateCallCount, 1)
    }

    func testRebuildStatusMenuRefreshesItems() {
        let defaults = InMemoryDefaults()
        let center = NotificationCenter()
        let store = SnippetStore(defaults: defaults, notificationCenter: center)
        defaults.set(try? JSONEncoder().encode([Snippet(title: "One", text: "A")]), forKey: "com.mprlab.PromptDew.snippets")
        let delegate = AppDelegate(snippetStore: store,
                                   accessibilityService: StubAccessibility(trusted: true),
                                   keyTyper: RecordingTyper(),
                                   notificationCenter: center,
                                   statusItemFactory: { NSStatusItem() })

        delegate.buildStatusMenu()
        store.save([Snippet(title: "Two", text: "B")])
        delegate.rebuildStatusMenu()
        let titles = delegate.currentMenu()?.items
            .filter { $0.action == #selector(AppDelegate.insertSnippet(_:)) }
            .map { $0.title }

        XCTAssertEqual(titles, ["Two"])
    }

    func testBuildStatusMenuConfiguresButtonWhenAvailable() {
        let statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        let store = makeStore(with: [])
        let delegate = AppDelegate(snippetStore: store,
                                   accessibilityService: StubAccessibility(trusted: true),
                                   keyTyper: RecordingTyper(),
                                   notificationCenter: NotificationCenter(),
                                   statusItemFactory: { statusItem })
        defer { NSStatusBar.system.removeStatusItem(statusItem) }

        delegate.buildStatusMenu()

        XCTAssertEqual(statusItem.button?.title, "🫧")
        XCTAssertEqual(statusItem.button?.toolTip, "PromptDew")
    }

    func testMakeMenuShowsEmptyPlaceholderWhenNoSnippets() {
        let defaults = InMemoryDefaults()
        defaults.set(try? JSONEncoder().encode([Snippet]()), forKey: "com.mprlab.PromptDew.snippets")
        let store = SnippetStore(defaults: defaults, notificationCenter: NotificationCenter())
        let delegate = AppDelegate(snippetStore: store,
                                   accessibilityService: StubAccessibility(trusted: true),
                                   keyTyper: RecordingTyper(),
                                   notificationCenter: NotificationCenter(),
                                   statusItemFactory: { NSStatusItem() })

        let menu = delegate.makeMenu()
        let emptyItems = menu.items.filter { $0.title.contains("No snippets") }

        XCTAssertEqual(emptyItems.count, 1)
    }

    func testDefaultFactoriesCreateStatusItemAndPreferences() {
        let defaults = InMemoryDefaults()
        defaults.set(try? JSONEncoder().encode([Snippet(title: "One", text: "Value")]),
                     forKey: "com.mprlab.PromptDew.snippets")
        let store = SnippetStore(defaults: defaults, notificationCenter: NotificationCenter())
        let delegate = AppDelegate(snippetStore: store,
                                   accessibilityService: StubAccessibility(trusted: true),
                                   keyTyper: RecordingTyper(),
                                   notificationCenter: NotificationCenter())

        delegate.buildStatusMenu()
        XCTAssertNotNil(delegate.statusItemHandle())
        delegate.openPreferences()
        if let item = delegate.statusItemHandle() {
            NSStatusBar.system.removeStatusItem(item)
        }
    }

    private func makeStore(with snippets: [Snippet]) -> SnippetStore {
        let defaults = InMemoryDefaults()
        if let data = try? JSONEncoder().encode(snippets) {
            defaults.set(data, forKey: "com.mprlab.PromptDew.snippets")
        }
        return SnippetStore(defaults: defaults, notificationCenter: NotificationCenter())
    }
}

private final class RecordingTyper: KeyTyping {
    var typedTexts: [String] = []
    func type(text: String) {
        typedTexts.append(text)
    }
}

private final class StubAccessibility: AccessibilityProviding {
    var trusted: Bool
    private(set) var promptCalled = false

    init(trusted: Bool) {
        self.trusted = trusted
    }

    func isTrusted() -> Bool { trusted }

    @discardableResult
    func requestAccessWithPrompt() -> Bool {
        promptCalled = true
        return trusted
    }
}

private final class TestApplicationController: ApplicationControlling {
    private(set) var activationPolicyChanges: [NSApplication.ActivationPolicy] = []
    private(set) var activationCount = 0
    private(set) var terminateCallCount = 0

    @discardableResult
    func setActivationPolicy(_ policy: NSApplication.ActivationPolicy) -> Bool {
        activationPolicyChanges.append(policy)
        return true
    }

    func activate(ignoringOtherApps flag: Bool) {
        activationCount += 1
    }

    func terminate() {
        terminateCallCount += 1
    }
}

private final class StubPreferencesWindowController: PreferencesWindowController {
    private(set) var showCount = 0

    override func show() {
        showCount += 1
    }
}
