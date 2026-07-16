# Contributing to Plan Well

Thank you for deciding to contribute to Plan Well! We welcome contributions that improve the application's user experience, performance, and documentation. 

To ensure a smooth collaboration, please follow the guidelines outlined below.

---

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

### Reporting Bugs
If you find a bug or unexpected behavior:
1. Search the existing issues to ensure it hasn't already been reported.
2. If it is new, open a detailed issue describing:
   - The environment (OS, browser, Node.js version).
   - Exact steps to reproduce the bug.
   - The expected vs. actual outcomes.
   - Relevant screenshots or console errors.

### Suggesting Enhancements
We welcome ideas for new features or improvements:
1. Verify that your idea is not already tracked in the active issues.
2. Open an issue explaining the proposed change, the motivation behind it, and how it benefits users.

### Submitting Pull Requests (PRs)
1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Set up your local environment file (`.env.local`) as described in the installation guidelines.
3. Install dependencies and run tests/builds locally to verify your changes.
4. Keep commits clean, logical, and descriptive.
5. Submit a pull request targeting the `main` branch.

---

## Development Guidelines

- **Logic Preservation:** Do not modify the core meal-planning heuristics or nutrition rules (`lib/planner.js`) unless a mathematical or logic bug has been verified and approved in an issue.
- **Firebase Schemas:** Ensure all Cloud Firestore changes maintain backward compatibility for existing users and saved plans.
- **Vanilla CSS styling:** Do not add Tailwind CSS or other heavy utility frameworks to the code. Maintain styling separation via CSS Modules.
- **Editable Content:** Keep localizable or customizable text strings inside the appropriate JSON files under the `data/` directory where applicable.
- **Linting & Compilation Verification:** Always verify that the project builds clean without linting, type-checking, or filesystem errors on your machine before pushing code:
  ```bash
  npm run build
  ```

---

## Pull Request Checklist

Before submitting your PR, verify that it passes this checklist:
- [ ] The codebase builds successfully (`npm run build`) without any errors.
- [ ] No local configuration files, Firebase API secrets, or `.env.local` files are tracked by Git.
- [ ] Variable and method naming structures conform to camelCase formatting.
- [ ] Code comments are clear and kept up-to-date.
- [ ] Your commit messages explain *why* the change was made in addition to *what* was changed.
