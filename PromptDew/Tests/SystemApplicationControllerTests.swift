import XCTest
@testable import PromptDew

final class SystemApplicationControllerTests: XCTestCase {
    func testSetActivationPolicyAndActivate() {
        let controller = SystemApplicationController(application: NSApplication.shared, terminator: nil)

        _ = controller.setActivationPolicy(.regular)
        controller.activate(ignoringOtherApps: true)
    }

    func testTerminateUsesCustomHandler() {
        var terminated = false
        let controller = SystemApplicationController(application: NSApplication.shared) {
            terminated = true
        }

        controller.terminate()

        XCTAssertTrue(terminated)
    }
}
