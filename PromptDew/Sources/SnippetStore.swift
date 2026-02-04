import Foundation

struct Snippet: Codable, Equatable {
    var title: String
    var text: String
}

protocol SnippetDefaults {
    func data(forKey key: String) -> Data?
    func set(_ value: Any?, forKey key: String)
}

extension UserDefaults: SnippetDefaults {}

final class SnippetStore {
    static let shared = SnippetStore()
    static let snippetsChangedNotification = Notification.Name("com.mprlab.PromptDew.snippetsChanged")
    static let fallbackSnippets: [Snippet] = [
        Snippet(title: "Thanks", text: "Thanks for your message. I will get back to you shortly."),
        Snippet(title: "On It", text: "I am on it and will follow up by end of day."),
        Snippet(title: "Clarify", text: "Could you please clarify the requirements?")
    ]

    private let defaultsKey = "com.mprlab.PromptDew.snippets"
    private let defaults: SnippetDefaults
    private let notificationCenter: NotificationCenter

    init(defaults: SnippetDefaults = UserDefaults.standard,
         notificationCenter: NotificationCenter = .default) {
        self.defaults = defaults
        self.notificationCenter = notificationCenter
    }

    func load() -> [Snippet] {
        guard let data = defaults.data(forKey: defaultsKey),
              let decoded = try? JSONDecoder().decode([Snippet].self, from: data) else {
            return Self.fallbackSnippets
        }
        return decoded
    }

    func save(_ snippets: [Snippet]) {
        guard let data = try? JSONEncoder().encode(snippets) else { return }
        defaults.set(data, forKey: defaultsKey)
        notificationCenter.post(name: SnippetStore.snippetsChangedNotification, object: nil)
    }
}
