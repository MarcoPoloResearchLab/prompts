import AppKit

class PreferencesWindowController: NSObject, NSTableViewDataSource, NSTableViewDelegate, NSTextFieldDelegate {
    private let store: SnippetStore
    private(set) var window: NSWindow!
    private(set) var tableView: NSTableView!
    private var editControl: NSSegmentedControl!
    private var snippets: [Snippet] = []

    private enum Column: String {
        case title = "Title"
        case text = "Phrase"
    }

    init(snippetStore: SnippetStore = .shared) {
        self.store = snippetStore
        self.snippets = snippetStore.load()
        super.init()
        buildUI()
    }

    func show() {
        window.makeKeyAndOrderFront(nil)
    }

    private func buildUI() {
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 680, height: 420),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.center()
        window.title = "Preferences — Snippets"

        let content = NSView(frame: NSRect(x: 0, y: 0, width: 680, height: 420))
        content.autoresizingMask = [.width, .height]
        window.contentView = content

        let background = NSVisualEffectView()
        background.material = .underWindowBackground
        background.blendingMode = .behindWindow
        background.state = .active
        background.translatesAutoresizingMaskIntoConstraints = false
        content.addSubview(background)

        NSLayoutConstraint.activate([
            background.leadingAnchor.constraint(equalTo: content.leadingAnchor),
            background.trailingAnchor.constraint(equalTo: content.trailingAnchor),
            background.topAnchor.constraint(equalTo: content.topAnchor),
            background.bottomAnchor.constraint(equalTo: content.bottomAnchor)
        ])

        let stack = NSStackView()
        stack.orientation = .vertical
        stack.alignment = .leading
        stack.distribution = .fill
        stack.spacing = 12
        stack.edgeInsets = NSEdgeInsets(top: 24, left: 28, bottom: 24, right: 28)
        stack.translatesAutoresizingMaskIntoConstraints = false
        background.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: background.leadingAnchor),
            stack.trailingAnchor.constraint(equalTo: background.trailingAnchor),
            stack.topAnchor.constraint(equalTo: background.topAnchor),
            stack.bottomAnchor.constraint(equalTo: background.bottomAnchor)
        ])

        let titleLabel = NSTextField(labelWithString: "Snippets")
        titleLabel.font = NSFont.systemFont(ofSize: 22, weight: .semibold)
        stack.addArrangedSubview(titleLabel)

        let descriptionLabel = NSTextField(wrappingLabelWithString: "Add short phrases and use the menu bar bubble to insert them anywhere.")
        descriptionLabel.font = NSFont.systemFont(ofSize: 13)
        descriptionLabel.textColor = .secondaryLabelColor
        descriptionLabel.maximumNumberOfLines = 2
        stack.addArrangedSubview(descriptionLabel)

        let separator = NSBox()
        separator.boxType = .separator
        stack.addArrangedSubview(separator)

        tableView = NSTableView(frame: NSRect(x: 0, y: 0, width: 600, height: 280))
        tableView.autoresizingMask = [.width]
        tableView.usesAlternatingRowBackgroundColors = true
        tableView.rowHeight = 30
        tableView.intercellSpacing = NSSize(width: 8, height: 6)
        tableView.allowsEmptySelection = true
        tableView.allowsMultipleSelection = false
        tableView.delegate = self
        tableView.dataSource = self
        if #available(macOS 11.0, *) {
            tableView.style = .fullWidth
        }

        let titleCol = NSTableColumn(identifier: NSUserInterfaceItemIdentifier(Column.title.rawValue))
        titleCol.title = Column.title.rawValue
        titleCol.minWidth = 160
        tableView.addTableColumn(titleCol)

        let textCol = NSTableColumn(identifier: NSUserInterfaceItemIdentifier(Column.text.rawValue))
        textCol.title = Column.text.rawValue
        textCol.minWidth = 320
        tableView.addTableColumn(textCol)

        let scroll = NSScrollView()
        scroll.hasVerticalScroller = true
        scroll.documentView = tableView
        scroll.translatesAutoresizingMaskIntoConstraints = false
        scroll.heightAnchor.constraint(greaterThanOrEqualToConstant: 260).isActive = true
        stack.addArrangedSubview(scroll)

        let buttonRow = NSStackView()
        buttonRow.orientation = .horizontal
        buttonRow.alignment = .centerY
        buttonRow.spacing = 12
        buttonRow.distribution = .fill
        buttonRow.translatesAutoresizingMaskIntoConstraints = false

        editControl = NSSegmentedControl(images: [
            NSImage(named: NSImage.addTemplateName) ?? NSImage(),
            NSImage(named: NSImage.removeTemplateName) ?? NSImage()
        ], trackingMode: .momentary, target: self, action: #selector(handleEditSegment(_:)))
        editControl.segmentStyle = .rounded
        editControl.setLabel("Add", forSegment: 0)
        editControl.setLabel("Remove", forSegment: 1)
        editControl.toolTip = "Add or remove snippets"
        editControl.setWidth(90, forSegment: 0)
        editControl.setWidth(90, forSegment: 1)

        let spacer = NSView()
        spacer.translatesAutoresizingMaskIntoConstraints = false
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        let autoSaveLabel = NSTextField(labelWithString: "Changes save automatically")
        autoSaveLabel.font = NSFont.systemFont(ofSize: 12)
        autoSaveLabel.textColor = .secondaryLabelColor

        buttonRow.addArrangedSubview(editControl)
        buttonRow.addArrangedSubview(spacer)
        buttonRow.addArrangedSubview(autoSaveLabel)
        stack.addArrangedSubview(buttonRow)

        updateEditControlState()
    }

    // MARK: Actions

    @objc func addSnippet() {
        snippets.append(Snippet(title: "New Title", text: "New Phrase"))
        tableView.reloadData()
        let newIndex = snippets.count - 1
        tableView.selectRowIndexes(IndexSet(integer: newIndex), byExtendingSelection: false)
        if let view = tableView.view(atColumn: 0, row: newIndex, makeIfNecessary: true) as? NSTableCellView {
            view.textField?.becomeFirstResponder()
        }
        persistSnippets()
        updateEditControlState()
    }

    @objc func removeSnippet() {
        let row = tableView.selectedRow
        guard row >= 0 && row < snippets.count else { return }
        snippets.remove(at: row)
        tableView.reloadData()
        if snippets.isEmpty {
            tableView.deselectAll(nil)
        } else {
            let nextIndex = min(row, snippets.count - 1)
            tableView.selectRowIndexes(IndexSet(integer: nextIndex), byExtendingSelection: false)
        }
        persistSnippets()
        updateEditControlState()
    }
    
    private func persistSnippets() {
        store.save(snippets)
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
            let textField = NSTextField()
            textField.translatesAutoresizingMaskIntoConstraints = false
            textField.isBordered = false
            textField.isBezeled = false
            textField.drawsBackground = false
            textField.isEditable = true
            textField.font = NSFont.systemFont(ofSize: 14)
            textField.focusRingType = .exterior
            textField.delegate = self
            textField.tag = (columnId == Column.title.rawValue) ? 0 : 1
            cell.addSubview(textField)
            NSLayoutConstraint.activate([
                textField.leadingAnchor.constraint(equalTo: cell.leadingAnchor, constant: 4),
                textField.trailingAnchor.constraint(equalTo: cell.trailingAnchor, constant: -4),
                textField.topAnchor.constraint(equalTo: cell.topAnchor, constant: 3),
                textField.bottomAnchor.constraint(equalTo: cell.bottomAnchor, constant: -3)
            ])
            cell.textField = textField
        }

        let snippet = snippets[row]
        if columnId == Column.title.rawValue {
            cell.textField?.stringValue = snippet.title
        } else {
            cell.textField?.stringValue = snippet.text
        }
        cell.textField?.toolTip = String(row)
        return cell
    }

    func tableViewSelectionDidChange(_ notification: Notification) {
        updateEditControlState()
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
        persistSnippets()
    }

    func snapshotSnippets() -> [Snippet] {
        return snippets
    }

    @objc private func handleEditSegment(_ sender: NSSegmentedControl) {
        switch sender.selectedSegment {
        case 0:
            addSnippet()
        case 1:
            removeSnippet()
        default:
            break
        }
    }

    private func updateEditControlState() {
        editControl?.setEnabled(true, forSegment: 0)
        let hasSelection = tableView.selectedRow >= 0
        editControl?.setEnabled(hasSelection, forSegment: 1)
    }
}
