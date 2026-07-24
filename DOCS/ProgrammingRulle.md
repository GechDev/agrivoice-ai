# Coding Standards & Development Rules

## Purpose

This document defines the coding standards for the AgriVoice project.

The objective is to produce code that is:

* Readable
* Maintainable
* Testable
* Scalable
* Consistent across the team

These standards are intended to guide development without slowing down delivery.

---

# Core Principles

Every piece of code should follow these principles:

* Keep code simple.
* Prefer readability over cleverness.
* Solve one problem at a time.
* Avoid unnecessary abstraction.
* Optimize only after correctness.
* Write code for the next developer, not just yourself.

A future teammate should understand your code without needing an explanation.

---

# General Development Rules

Developers should:

* Follow the existing project architecture.
* Reuse existing code before creating new implementations.
* Keep functions focused on a single responsibility.
* Avoid duplicated logic.
* Remove unused code before committing.
* Leave the codebase cleaner than you found it.

Avoid introducing new libraries unless there is a clear technical benefit.

---

# File Organization

Files should have a single responsibility.

Good examples:

```text
UserService.py
PredictionService.py
MarketRepository.py
VoiceController.py
```

Avoid files that become "God Objects" containing unrelated functionality.

---

# Function Design

Every function should:

* Perform one logical task.
* Have a descriptive name.
* Return predictable results.
* Handle expected errors gracefully.
* Be easy to test.

Prefer:

```text
calculatePrediction()
validateReport()
findMarket()
```

Instead of:

```text
doStuff()
helper()
process()
```

---

# Function Size

Recommended guidelines:

* 10–40 lines for most functions.
* Split functions that become difficult to read.
* Avoid deeply nested logic.

If indentation exceeds three levels, consider refactoring.

---

# Naming Conventions

Use descriptive names.

Variables:

```text
marketPrice
predictionConfidence
reportCount
```

Avoid:

```text
x
temp
value
data1
```

Booleans should read naturally:

```text
isAuthenticated
hasRecentReports
canSubmit
```

Collections should be plural:

```text
markets
reports
users
```

---

# Code Reuse

Before writing new code:

1. Search for an existing implementation.
2. Extend reusable components.
3. Create shared utilities only when used in multiple places.

Do not copy and paste logic.

---

# Error Handling

Never ignore errors.

Handle expected failures explicitly.

Good examples:

* Invalid user input
* Missing database record
* API timeout
* AI provider unavailable
* Speech recognition failure

Error messages should:

* Explain what happened.
* Avoid exposing internal details.
* Help debugging through logs.

---

# Logging

Log meaningful events.

Log:

* Unexpected exceptions
* External API failures
* Authentication failures
* Prediction failures
* Voice processing failures

Do not log:

* Passwords
* Tokens
* API keys
* Sensitive user data
* Entire request bodies containing personal information

---

# Comments

Code should explain itself.

Comments should explain **why**, not **what**.

Good:

```text
// Retry because speech providers occasionally timeout.
```

Avoid:

```text
// Increment i
i++
```

Remove commented-out code before committing.

---

# Formatting

Use the project's formatter.

Requirements:

* Consistent indentation
* Consistent spacing
* Consistent import ordering
* No trailing whitespace
* One statement per line

Never manually fight the formatter.

---

# API Development Rules

Every endpoint should:

* Validate input.
* Return consistent response structures.
* Use proper HTTP status codes.
* Return meaningful error messages.
* Never expose stack traces.

Prefer:

```json
{
    "success": true,
    "data": { }
}
```

Errors:

```json
{
    "success": false,
    "message": "Market not found"
}
```

---

# Database Rules

Use the database responsibly.

Rules:

* Use transactions when modifying multiple related records.
* Validate data before insertion.
* Never trust client input.
* Use indexes where appropriate.
* Avoid unnecessary queries.
* Prevent duplicate records where possible.

Database access should remain inside repository or service layers.

---

# Frontend Rules (Next.js)

Components should:

* Be small.
* Be reusable.
* Have a single responsibility.

Prefer composition over large components.

Separate:

* UI
* Business logic
* API communication
* State management

Avoid placing business logic directly inside UI components.

---

# Backend Rules (FastAPI)

Keep controllers lightweight.

Controllers should:

* Validate requests.
* Call services.
* Return responses.

Business logic belongs inside service classes.

Database access belongs inside repositories.

Example:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

---

# AI Integration Rules

The AI model must never become the source of truth.

Business rules must remain in application code.

The AI should only:

* Generate natural language.
* Interpret user intent.
* Assist with language processing.

The AI must never:

* Invent prices.
* Modify database records directly.
* Make authorization decisions.
* Replace validation logic.

Structured data remains authoritative, consistent with the project specification.

---

# External API Rules

Every external service call should:

* Have a timeout.
* Handle retries when appropriate.
* Handle failures gracefully.
* Log unexpected errors.

Never assume third-party services are always available.

---

# Security Rules

Always:

* Validate input.
* Sanitize user data.
* Store secrets in environment variables.
* Use HTTPS where applicable.
* Verify permissions before protected actions.

Never:

* Commit secrets.
* Hardcode API keys.
* Trust client-side validation alone.

---

# Performance Guidelines

Write efficient code by default.

Avoid:

* Duplicate database queries.
* Repeated API requests.
* Unnecessary rendering.
* Blocking operations.
* Large payloads.

Optimize only when there is measurable benefit.

---

# Git Rules

Each branch should implement one logical feature.

Each commit should:

* Compile successfully.
* Pass local tests.
* Represent one logical change.

Avoid mixing unrelated work in a single commit.

---

# Pull Request Guidelines

A Pull Request should:

* Be reasonably small and focused.
* Include a clear description.
* Reference the related task or issue if applicable.
* Explain architectural decisions when introducing new patterns.

Reviewers should understand the change without reading every file.

---

# Code Review Checklist

Before requesting review, verify:

* Code builds successfully.
* No duplicated logic.
* No unused imports.
* No debug statements.
* No commented-out code.
* Proper error handling.
* Consistent naming.
* Existing tests still pass.
* New functionality tested.

---

# Documentation

Update documentation whenever:

* APIs change.
* Database schema changes.
* Environment variables change.
* Project setup changes.
* Architectural decisions change.

Documentation is part of the codebase.

---

# Flexibility

These standards are guidelines, not rigid rules.

Developers may deviate when there is a clear technical justification, provided that:

* The reasoning is documented.
* The solution improves maintainability or performance.
* The team agrees during code review.

Consistency is preferred, but sound engineering judgment always takes precedence.

---

# Engineering Mindset

Before submitting code, ask:

* Is this the simplest solution?
* Is it easy to understand?
* Is it consistent with the project?
* Can another developer maintain it?
* Have I considered failure cases?
* Does it improve the overall quality of the codebase?

The best code is not the most complex—it is the code that solves the problem clearly, correctly, and can be maintained by the next engineer.
