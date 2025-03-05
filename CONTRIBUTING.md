# Contributing to AppletHub

We love your input! We want to make contributing to AppletHub as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Pull Request Process

1. Update the README.md or documentation with details of changes, if applicable
2. Update the CHANGELOG.md with the changes made
3. The PR should work for the supported platforms (Linux, MacOS, Windows)
4. The PR will be merged once it receives approval from the maintainers

## Development Guidelines

### Code Style

- Follow the TypeScript style guidelines in CLAUDE.md
- Maintain consistent indentation (2 spaces)
- Use meaningful variable and function names
- Write descriptive comments, especially for complex logic
- Use TypeScript types and interfaces for better type safety

### Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a PR
- Aim for good test coverage of your code

### Documentation

- Update documentation when changing or adding features
- Write clear, concise, and accurate documentation
- Include examples where appropriate

## Module Development

When developing new modules for AppletHub:

1. Use the Module Development Kit (MDK) to create a new module:
   ```bash
   applet create my-module
   ```

2. Follow the module structure guidelines:
   - Keep the module focused on a single responsibility
   - Document the module's API and capabilities
   - Ensure the module has proper error handling

3. Test the module thoroughly before submitting

## Issue Reporting

When reporting an issue, please include:

- A clear and descriptive title
- A detailed description of the issue
- Steps to reproduce the behavior
- Expected behavior
- Screenshots (if applicable)
- Environment details (OS, browser, etc.)

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project, you agree to abide by its terms.

## Questions?

If you have questions, please open an issue or reach out to the maintainers directly.