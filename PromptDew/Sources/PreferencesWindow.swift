import AppKit

final class PreferencesWindowController: NSObject, NSTableViewDataSource, NSTableViewDelegate, NSTextFieldDelegate {
    private var window: NSWindow!
    private var tableView: NSTableView!
    private var snippets: [Snippet] = []

    private enum Column: String {
        case title = "Title"
        case text = "Phrase"
    }

    override init() {
        super.init()
        self.snippets = SnippetStore.shared.load()
        buildUI()
    }

    func show() {
        window.makeKeyAndOrderFront(nil)
    }

    private func buildUI() {
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 640, height: 380),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.center()
        window.title = "Preferences — Snippets"

        let content = NSView(frame: NSRect(x: 0, y: 0, width: 640, height: 380))
        window.contentView = content

        // Table
        let scroll = NSScrollView(frame: NSRect(x: 20, y: 60, width: 600, height: 280))
        scroll.hasVerticalScroller = true

        tableView = NSTableView(frame: scroll.bounds)
        tableView.usesAlternatingRowBackgroundColors = true
        tableView.rowHeight = 24
        tableView.delegate = self
        tableView.dataSource = self

        let titleCol = NSTableColumn(identifier: NSUserInterfaceItemIdentifier(Column.title.rawValue))
        titleCol.title = Column.title.rawValue
        titleCol.width = 180
        tableView.addTableColumn(titleCol)

        let textCol = NSTableColumn(identifier: NSUserInterfaceItemIdentifier(Column.text.rawValue))
        textCol.title = Column.text.rawValue
        textCol.width = 400
        tableView.addTableColumn(textCol)

        scroll.documentView = tableView
        content.addSubview(scroll)

        // Buttons
        let addButton = NSButton(title: "Add", target: self, action: #selector(addSnippet))
        addButton.frame = NSRect(x: 20, y: 20, width: 80, height: 28)
        content.addSubview(addButton)

        let removeButton = NSButton(title: "Remove", target: self, action: #selector(removeSnippet))
        removeButton.frame = NSRect(x: 110, y: 20, width: 80, height: 28)
        content.addSubview(removeButton)

        let saveButton = NSButton(title: "Save", target: self, action: #selector(saveSnippets))
        saveButton.frame = NSRect(x: 540, y: 20, width: 80, height: 28)
        content.addSubview(saveButton)
    }

    // MARK: Actions

    @objc private func addSnippet() {
        snippets.append(Snippet(title: "New Title", text: "New Phrase"))
        tableView.reloadData()
        let newIndex = snippets.count - 1
        tableView.selectRowIndexes(IndexSet(integer: newIndex), byExtendingSelection: false)
        if let view = tableView.view(atColumn: 0, row: newIndex, makeIfNecessary: true) as? NSTableCellView {
            view.textField?.becomeFirstResponder()
        }
    }

    @objc private func removeSnippet() {
        let row = tableView.selectedRow
        guard row >= 0 && row < snippets.count else { return }
        snippets.remove(at: row)
        tableView.reloadData()
    }

    @objc private func saveSnippets() {
        SnippetStore.shared.save(snippets)
    }

    // MARK: Table DataSource

    func numberOfRows(in tableView: NSTableView) -> Int { return snippets.count }

    // MARK: Table Delegate

    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        guard row < snippets.count else { return nil }
        let identifier = tableColumn!.identifier
        let columnId = identifier.rawValue

        let cellId = NSUserInterfaceItemIdentifier("Cell_\(columnId)")
        let cell: NSTableCellView
        if let existing = tableView.makeView(withIdentifier: cellId, owner: self) as? NSTableCellView {
            cell = existing
        } else {
            cell = NSTableCellView()
            cell.identifier = cellId
            let textField = NSTextField(frame: NSRect(x: 2, y: 2, width: tableColumn!.width - 4, height: 20))
            textField.isBordered = true
            textField.isBezeled = true
            textField.isEditable = true
            textField.delegate = self
            textField.tag = (columnId == Column.title.rawValue) ? 0 : 1
            cell.addSubview(textField)
            cell.textField = textField
        }

        let snippet = snippets[row]
        if columnId == Column.title.rawValue {
            cell.textField?.stringValue = snippet.title
        } else {
            cell.textField?.stringValue = snippet.text
        }
        // Store row in accessibility help for retrieval
        cell.textField?.toolTip = String(row)
        return cell
    }

    func controlTextDidEndEditing(_ obj: Notification) {
        guard let textField = obj.object as? NSTextField,
              let rowString = textField.toolTip,
              let row = Int(rowString),
              row >= 0 && row < snippets.count else { return }
        let isTitle = (textField.tag == 0)
        if isTitle {
            snippets[row].title = textField.stringValue
        } else {
            snippets[row].text = textField.stringValue
        }
    }
}
