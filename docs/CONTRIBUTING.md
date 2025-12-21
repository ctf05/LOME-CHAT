# Contributing

Guide for contributing to LOME-CHAT.

---

## Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm 10.26.0** - Install with `npm install -g pnpm@10.26.0`
- **Docker** - [Download](https://docker.com/products/docker-desktop/)

---

## Quick Start

```bash
git clone https://github.com/LOME-AI/LOME-CHAT.git
cd lome-chat
pnpm install
pnpm dev
```

This starts Docker services, runs migrations, and launches all dev servers.

---

## Documentation

- [TECH-STACK.md](./TECH-STACK.md) - Architecture and technology decisions
- [CODE-RULES.md](./CODE-RULES.md) - Coding standards
- [FEATURES.md](./FEATURES.md) - Feature list and roadmap

---

## Pull Request Process

1. Create a branch or fork from `main`
2. Make changes with tests
3. Ensure all checks pass (`pnpm lint && pnpm typecheck && pnpm test`)
4. Submit PR with clear description
5. Address review feedback
6. LOME team runs "pr test" for integration tests
7. Merge when approved

---

## Contributor License Agreement

All contributors must agree to our [CLA](../CLA.md) before PRs can be merged. A GitHub bot will prompt you on your first PR.

---

## Questions?

- Open an issue for bugs or feature requests
- Email hello@lome-chat.com for other inquiries
