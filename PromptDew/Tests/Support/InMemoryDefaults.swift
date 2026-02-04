import Foundation
@testable import PromptDew

final class InMemoryDefaults: SnippetDefaults {
    private var storage: [String: Data] = [:]

    func data(forKey key: String) -> Data? {
        storage[key]
    }

    func set(_ value: Any?, forKey key: String) {
        guard let data = value as? Data else {
            storage.removeValue(forKey: key)
            return
        }
        storage[key] = data
    }
}
