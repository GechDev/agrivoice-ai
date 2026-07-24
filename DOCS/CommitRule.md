# Git Workflow & Commit Convention

## Purpose

This document defines the Git workflow and commit standards for the project. Every team member must follow these rules to ensure a clean Git history, reduce merge conflicts, and maintain code quality.

---

# Branch Strategy

The repository uses the following long-lived branches:

| Branch    | Purpose                                        |
| --------- | ---------------------------------------------- |
| `main`    | Production-ready and stable code only.         |
| `develop` | Integration branch for all completed features. |

**Rules**

* Never commit directly to `main`.
* Never commit directly to `develop`.
* All work must be completed on a separate branch.
* All merges must be performed through a Pull Request (PR).

---

# Branch Naming Convention

## Feature

```
feature/<short-description>
```

Examples

```
feature/user-authentication
feature/dashboard-ui
feature/payment-api
feature/profile-management
```

---

## Bug Fix

```
bugfix/<short-description>
```

Examples

```
bugfix/login-validation
bugfix/navbar-overlap
bugfix/token-refresh
```

---

## Hot Fix

```
hotfix/<short-description>
```

Examples

```
hotfix/security-patch
hotfix/server-crash
```

---

## Refactoring

```
refactor/<short-description>
```

Examples

```
refactor/auth-service
refactor/database-layer
```

---

## Documentation

```
docs/<short-description>
```

Examples

```
docs/readme
docs/api
```

---

## Testing

```
test/<short-description>
```

Examples

```
test/authentication
test/payment
```

---

# Commit Message Convention

Follow the Conventional Commits specification.

```
<type>: <short description>
```

## Allowed Types

| Type       | Description                                |
| ---------- | ------------------------------------------ |
| `feat`     | New feature                                |
| `fix`      | Bug fix                                    |
| `refactor` | Code improvement without changing behavior |
| `docs`     | Documentation changes                      |
| `style`    | Formatting, whitespace, linting            |
| `test`     | Adding or updating tests                   |
| `chore`    | Maintenance, dependencies, configuration   |

### Examples

```
feat: implement JWT authentication

feat: add dashboard analytics

fix: resolve login validation issue

fix: prevent duplicate user registration

refactor: simplify authentication middleware

docs: update installation guide

test: add authentication unit tests

style: format API routes

chore: update project dependencies
```

---

# Daily Workflow

### 1. Update your local repository

```bash
git checkout develop
git pull origin develop
```

### 2. Create a new branch

```bash
git checkout -b feature/user-authentication
```

### 3. Develop your feature

Commit regularly using meaningful commit messages.

### 4. Push your branch

```bash
git push origin feature/user-authentication
```

### 5. Create a Pull Request

* Source: your feature branch
* Target: `develop`

### 6. Code Review

At least **one team member** must review the Pull Request before merging.

### 7. Merge

Once approved and all checks pass, merge into `develop`.

---

# Pull Request Rules

Every Pull Request must:

* Have a clear and descriptive title.
* Address only one feature or bug.
* Be based on the latest `develop` branch.
* Resolve all merge conflicts before review.
* Pass all automated tests (if available).
* Receive at least one approval before merging.

Example PR titles:

```
feat: implement user authentication

fix: resolve dashboard loading issue

refactor: optimize database queries
```

---

# Code Review Guidelines

Reviewers should verify:

* Code follows project standards.
* No unnecessary or commented-out code.
* No secrets, passwords, or API keys are committed.
* Proper error handling is included.
* Code is readable and maintainable.
* Feature works as expected.
* Existing functionality is not broken.

---

# Team Responsibilities

Each developer is responsible for:

* Pulling the latest changes before starting work.
* Working only on their assigned branch.
* Writing descriptive commit messages.
* Keeping commits small and focused.
* Testing their code before opening a Pull Request.
* Responding to review comments promptly.

---

# Branch Protection Rules

The following actions are prohibited:

* Direct pushes to `main`.
* Direct pushes to `develop`.
* Force pushes to shared branches.
* Merging without review.
* Committing generated files unless required.
* Committing secrets, credentials, or environment files.

---

# Best Practices

* Keep each branch focused on a single task.
* Commit early and commit often.
* Write meaningful commit messages.
* Rebase or merge from `develop` regularly to minimize conflicts.
* Delete feature branches after they are merged.
* Communicate with the team before making major architectural changes.

---

# Workflow Overview

```
main
│
└── develop
     ├── feature/user-authentication
     ├── feature/dashboard-ui
     ├── feature/payment-api
     ├── bugfix/login-validation
     ├── refactor/auth-service
     └── docs/readme
```

---

# Summary

1. Pull the latest `develop`.
2. Create a feature branch.
3. Commit using Conventional Commits.
4. Push your branch.
5. Open a Pull Request to `develop`.
6. Obtain at least one approval.
7. Merge into `develop`.
8. Delete the merged branch.
9. Merge `develop` into `main` only for stable releases.
