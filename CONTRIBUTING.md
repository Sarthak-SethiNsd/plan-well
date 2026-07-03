# Contributing

Thank you for your interest in improving Plan Well.

## Getting Started

1. Fork or clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` from `.env.local.example`.
4. Run the development server:

```bash
npm run dev
```

## Development Guidelines

- Keep the existing UI and user experience consistent.
- Do not change the meal-planning algorithm unless the change is intentional and reviewed.
- Keep Firebase document schemas backward compatible.
- Keep content that should be editable in JSON files where possible.
- Run a production build before opening a pull request:

```bash
npm run build
```

## Pull Request Checklist

- The project builds successfully.
- No secrets or local environment files are committed.
- User-facing behavior is documented when changed.
- Firebase rule changes are noted when required.
