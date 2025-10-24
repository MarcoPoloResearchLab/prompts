import Foundation

struct Snippet: Codable, Equatable {
    var title: String
    var text: String
}

final class SnippetStore {
    static let shared = SnippetStore()
    static let snippetsChangedNotification = Notification.Name("com.mprlab.PromptDew.snippetsChanged")

    private let defaultsKey = "com.mprlab.PromptDew.snippets"
    private let defaultSnippets: [Snippet] = [
        Snippet(title: "Thanks", text: "Thanks for your message. I will get back to you shortly."),
        Snippet(title: "On It", text: "I am on it and will follow up by end of day."),
        Snippet(title: "Clarify", text: "Could you please clarify the requirements?")
    ]

    func load() -> [Snippet] {
        let d = UserDefaults.standard
        guard let data = d.data(forKey: defaultsKey),
              let decoded = try? JSONDecoder().decode([Snippet].self, from: data) else {
            return defaultSnippets
        }
        return decoded
    }

    func save(_ snippets: [Snippet]) {
        guard let data = try? JSONEncoder().encode(snippets) else { return }
        UserDefaults.standard.set(data, forKey: defaultsKey)
        NotificationCenter.default.post(name: SnippetStore.snippetsChangedNotification, object: nil)
    }
}
