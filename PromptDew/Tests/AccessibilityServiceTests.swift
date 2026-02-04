import XCTest
@testable import PromptDew

final class AccessibilityServiceTests: XCTestCase {
    func testRequestAccessReturnsTrueWhenAlreadyTrusted() {
        var promptInvoked = false
        let service = SystemAccessibilityService(
            isTrusted: { true },
            prompt: { _ in
                promptInvoked = true
                return true
            }
        )

        XCTAssertTrue(service.requestAccessWithPrompt())
        XCTAssertFalse(promptInvoked)
    }

    func testRequestAccessPromptsWhenUntrustedThenRechecksState() {
        var promptInvoked = false
        var trustedState = false
        let service = SystemAccessibilityService(
            isTrusted: {
                trustedState
            },
            prompt: { _ in
                promptInvoked = true
                trustedState = true
                return true
            }
        )

        XCTAssertTrue(service.requestAccessWithPrompt())
        XCTAssertTrue(promptInvoked)
    }

    func testIsTrustedDelegatesToHandler() {
        var called = false
        let service = SystemAccessibilityService(isTrusted: {
            called = true
            return true
        }, prompt: { _ in true })

        XCTAssertTrue(service.isTrusted())
        XCTAssertTrue(called)
    }

    func testDefaultServiceInvokesSystemAPI() {
        let service = SystemAccessibilityService()
        _ = service.isTrusted()
    }
}
