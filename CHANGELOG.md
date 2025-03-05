# Changelog

All notable changes to the AppletHub project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Admin Dashboard module for system monitoring and management
  - System information panel with resource usage stats
  - Module manager for starting/stopping modules
  - TupleStore explorer with interactive data browser
  - Dashboard service for programmatic access to system info
- Documentation framework with guides, API references, and architecture overviews
- CONTRIBUTING.md guide for new contributors
- CHANGELOG.md to track project changes
- Server process management with graceful shutdown
- Test mode flag (--test) for automatic server shutdown

### Changed
- Improved project directory structure (removed .ts extensions from directories)
- Enhanced TupleStore factory with convenient creation methods
- Updated README with comprehensive documentation
- Separated examples into dedicated examples.ts file
- Restructured package.json scripts for better developer experience

## [0.1.0] - 2025-03-05

### Added
- Initial release of AppletHub
- Module system with dependency resolution
- TupleStore implementation (Core, Journaled, Observable)
- UI component framework
- Client SDK
- Server modules (HTTP, WebSocket, GitHub webhook)
- Module Development Kit (MDK) with CLI tool
  - Template-based module generation
  - Development server
  - Module creation wizard

### Changed
- N/A (initial release)

### Fixed
- N/A (initial release)