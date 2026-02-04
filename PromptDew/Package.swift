// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "PromptDew",
    platforms: [
        .macOS(.v12)
    ],
    products: [
        .executable(
            name: "PromptDew",
            targets: ["PromptDew"]
        )
    ],
    targets: [
        .executableTarget(
            name: "PromptDew",
            path: "Sources"
        ),
        .testTarget(
            name: "PromptDewTests",
            dependencies: ["PromptDew"],
            path: "Tests"
        )
    ]
)
