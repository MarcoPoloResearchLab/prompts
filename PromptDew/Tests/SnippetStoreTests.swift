import XCTest
@testable import PromptDew

final class SnippetStoreTests: XCTestCase {
    func testLoadReturnsFallbackSnippetsWhenNoDataStored() {
        let defaults = InMemoryDefaults()
        let store = SnippetStore(defaults: defaults, notificationCenter: NotificationCenter())

        XCTAssertEqual(store.load(), SnippetStore.fallbackSnippets)
    }

    func testLoadReturnsDecodedSnippetsWhenDataExists() throws {
        let defaults = InMemoryDefaults()
        let storedSnippets = [
            Snippet(title: "Alpha", text: "First"),
            Snippet(title: "Beta", text: "Second")
        ]
        let encoded = try JSONEncoder().encode(storedSnippets)
        defaults.set(encoded, forKey: "com.mprlab.PromptDew.snippets")
        let store = SnippetStore(defaults: defaults, notificationCenter: NotificationCenter())

        XCTAssertEqual(store.load(), storedSnippets)
    }

    func testSavePersistsSnippetsAndPostsNotification() {
        let defaults = InMemoryDefaults()
        let center = NotificationCenter()
        let store = SnippetStore(defaults: defaults, notificationCenter: center)
        let snippets = [Snippet(title: "Gamma", text: "Third")]

        let expectation = self.expectation(
            forNotification: SnippetStore.snippetsChangedNotification,
            object: nil,
            notificationCenter: center,
            handler: nil
        )

        store.save(snippets)

        wait(for: [expectation], timeout: 1.0)
        guard let data = defaults.data(forKey: "com.mprlab.PromptDew.snippets") else {
            XCTFail("Expected data to be stored")
            return
        }
        let decoded = try? JSONDecoder().decode([Snippet].self, from: data)
        XCTAssertEqual(decoded, snippets)
    }
}
