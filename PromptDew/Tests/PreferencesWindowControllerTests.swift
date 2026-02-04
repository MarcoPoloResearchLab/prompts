import XCTest
@testable import PromptDew

@MainActor
final class PreferencesWindowControllerTests: XCTestCase {
    func testAddAndRemoveSnippetUpdatesTable() throws {
        let store = makeStore(with: [
            Snippet(title: "Hello", text: "World")
        ])
        let controller = PreferencesWindowController(snippetStore: store)

        controller.addSnippet()
        XCTAssertEqual(controller.snapshotSnippets().count, 2)
        XCTAssertEqual(store.load().count, 2)

        controller.tableView.selectRowIndexes(IndexSet(integer: 0), byExtendingSelection: false)
        controller.removeSnippet()
        XCTAssertEqual(controller.snapshotSnippets().count, 1)
        XCTAssertEqual(store.load().count, 1)
    }

    func testTableEditingAutoSaves() throws {
        let store = makeStore(with: [
            Snippet(title: "Alpha", text: "First")
        ])
        let controller = PreferencesWindowController(snippetStore: store)
        guard let firstColumn = controller.tableView.tableColumns.first else {
            XCTFail("Missing column")
            return
        }
        let view = controller.tableView(controller.tableView, viewFor: firstColumn, row: 0) as? NSTableCellView
        let textField = view?.textField
        textField?.stringValue = "Updated"
        textField?.toolTip = "0"
        controller.controlTextDidEndEditing(Notification(name: NSText.didEndEditingNotification, object: textField))

        XCTAssertEqual(controller.snapshotSnippets().first?.title, "Updated")
        XCTAssertEqual(store.load().first?.title, "Updated")
    }

    private func makeStore(with snippets: [Snippet]) -> SnippetStore {
        let defaults = InMemoryDefaults()
        if let data = try? JSONEncoder().encode(snippets) {
            defaults.set(data, forKey: "com.mprlab.PromptDew.snippets")
        }
        return SnippetStore(defaults: defaults, notificationCenter: NotificationCenter())
    }
}
