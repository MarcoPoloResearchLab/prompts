import XCTest
@testable import PromptDew

final class KeyTyperTests: XCTestCase {
    func testTyperPostsEventsPerScalar() {
        final class Poster: KeyEventPosting {
            var sequences: [[UniChar]] = []
            func post(utf16Characters: inout [UniChar]) {
                sequences.append(utf16Characters)
            }
        }

        let poster = Poster()
        let typer = SystemKeyTyper(poster: poster)

        typer.type(text: "ab")

        XCTAssertEqual(poster.sequences.count, 2)
        XCTAssertEqual(poster.sequences.map { String(utf16CodeUnits: $0, count: $0.count) }, ["a", "b"])
    }

    func testCGKeyEventPosterAssignsUnicodeStrings() {
        var postedStrings: [String] = []
        let poster = CGKeyEventPoster(
            downFactory: { CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true) },
            upFactory: { CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false) },
            eventPoster: { event in
                var length: Int = 0
                var buffer = [UniChar](repeating: 0, count: 4)
                event.keyboardGetUnicodeString(maxStringLength: 4, actualStringLength: &length, unicodeString: &buffer)
                postedStrings.append(String(utf16CodeUnits: buffer, count: length))
            }
        )

        var characters: [UniChar] = Array("x".utf16)
        poster.post(utf16Characters: &characters)

        XCTAssertEqual(postedStrings, ["x", "x"])
    }

    func testSystemKeyTyperUsesPosterFactory() {
        final class Poster: KeyEventPosting {
            var typed = ""
            func post(utf16Characters: inout [UniChar]) {
                typed += String(utf16CodeUnits: utf16Characters, count: utf16Characters.count)
            }
        }
        let poster = Poster()
        SystemKeyTyper.posterFactory = { poster }
        defer { SystemKeyTyper.posterFactory = { CGKeyEventPoster() } }

        let typer = SystemKeyTyper()
        typer.type(text: "ok")

        XCTAssertEqual(poster.typed, "ok")
    }

    func testDefaultCGKeyEventPosterUsesSystemFactories() {
        var postedStrings: [String] = []
        let poster = CGKeyEventPoster(eventPoster: { event in
            var length: Int = 0
            var buffer = [UniChar](repeating: 0, count: 4)
            event.keyboardGetUnicodeString(maxStringLength: 4, actualStringLength: &length, unicodeString: &buffer)
            postedStrings.append(String(utf16CodeUnits: buffer, count: length))
        })
        var characters: [UniChar] = Array("z".utf16)
        poster.post(utf16Characters: &characters)
        XCTAssertEqual(postedStrings, ["z", "z"])
    }
}
