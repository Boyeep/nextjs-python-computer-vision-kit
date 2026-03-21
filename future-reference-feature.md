# Future Reference Features

Reusable internal features from this repo that are worth carrying into other starter templates, even when the project is not computer vision related.

This file is intentionally repo-builder focused. It is not the product roadmap. It is a reference for "what made this template solid internally" so the same moves can be reused in future kits.

If you want the shorter copy-forward version, see `template-playbook.md`.

## Core Idea

This repo ended up with two layers:

1. product-specific features
2. template-grade infrastructure

The product-specific layer here is computer vision.

The template-grade layer is the part worth reusing almost anywhere:

- contributor docs
- agent docs
- split CI
- release automation
- security scanning
- license reporting
- SBOM generation
- repo governance
- image/build verification
- smoke testing after release

If you build another starter later, this second layer is the piece to copy and adapt first.

## Reusable Features Added Here

### 1. Contributor and Maintainer Documentation

Files:

- `README.md`
- `CONTRIBUTING.md`
- `AGENTS.md`
- `SECURITY.md`
- `soon.md`

Why it matters:

- makes the repo understandable without tribal knowledge
- gives both humans and coding agents a safe workflow
- reduces setup mistakes and PR drift
- makes the template feel production-minded instead of demo-only

Generic takeaway:

- every serious starter should have a short public README
- every serious starter should have a contributor guide
- every serious starter should have an internal or agent-facing rules file
- every public starter should have a security reporting path

### 2. Root Script Layer

Files:

- `scripts/dev.mjs`
- `scripts/check.mjs`
- `scripts/check-contract-drift.mjs`
- `scripts/check-docker-builds.mjs`
- `scripts/check-release-smoke.mjs`
- `scripts/check-actionlint.mjs`
- `scripts/check-secrets.mjs`
- `scripts/report-licenses.mjs`
- `package.json`

Why it matters:

- gives one stable entrypoint for local work
- keeps repo ergonomics consistent across projects
- avoids burying important workflows inside long docs
- makes CI and local commands line up cleanly

Generic takeaway:

- keep a root `dev` command
- keep a root `check` command
- add small focused helper scripts instead of giant shell blobs in workflows
- prefer reusable scripts that can run locally and in CI

### 3. Split CI Instead of One Giant Workflow

File:

- `.github/workflows/template-ci.yml`

What it covers here:

- workflow lint
- secret scan
- contract drift
- frontend verification
- backend verification
- Windows root check
- Docker image build checks

Why it matters:

- failures are easier to read
- faster signal on what actually broke
- easier to reuse parts in other repos
- lets platform-specific behavior get real coverage

Generic takeaway:

- split CI by concern, not by habit
- keep one job for each meaningful boundary
- add at least one cross-platform check if the repo supports Windows or other non-Linux dev environments

### 4. Contract Drift Protection

Files:

- `docs/openapi.yaml`
- `frontend/src/generated/openapi.ts`
- `scripts/check-contract-drift.mjs`

Why it matters:

- protects the boundary between subsystems
- catches "changed backend, forgot generated client" mistakes
- scales well to any API-first starter, not just CV

Generic takeaway:

- if a repo has a generated artifact from a source-of-truth contract, add a drift check
- examples:
  - OpenAPI to TS client
  - GraphQL schema to generated types
  - Prisma schema to generated client checks
  - protobuf or SDK generation checks

### 5. Docker Build Verification

Files:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `backend/.dockerignore`
- `frontend/.dockerignore`
- `scripts/check-docker-builds.mjs`

Why it matters:

- catches packaging mistakes early
- makes deployment feel first-class instead of an afterthought
- keeps runtime assumptions honest

Generic takeaway:

- if the template is meant to deploy, verify image builds in CI
- even if local Docker is optional, CI should still know whether images build

### 6. Release Automation

Files:

- `.github/release-drafter.yml`
- `.github/workflows/release-drafter.yml`
- `.github/workflows/release.yml`
- `.github/workflows/release-smoke.yml`
- `.github/workflows/sync-labels.yml`
- `.github/labels.json`

What it covers here:

- draft releases from merged PRs
- path-based autolabeling
- semver bump guidance through labels
- tag-triggered release workflow
- GHCR publishing
- release smoke test against published images
- synced repository labels

Why it matters:

- removes a lot of maintainer busywork
- makes releases predictable
- creates a repeatable flow that survives team growth
- turns the repo from "template code" into "maintainable productized template"

Generic takeaway:

- if the repo is public and meant to last, release automation is worth it
- release smoke tests are especially valuable because they test the thing users actually consume

### 7. Repo Governance and Maintainer UX

Files:

- `.github/CODEOWNERS`
- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/*`
- `.github/dependabot.yml`

Why it matters:

- sets review expectations
- improves issue quality
- makes ownership explicit
- keeps dependency maintenance from becoming invisible debt

Generic takeaway:

- small governance files have a large compounding payoff
- they are boring in the best possible way

### 8. Security Scanning

Files:

- `scripts/check-secrets.mjs`
- `scripts/report-licenses.mjs`
- `.github/workflows/template-ci.yml`
- `.github/workflows/codeql.yml`
- `.github/workflows/license-report.yml`
- `.github/workflows/sbom.yml`
- `SECURITY.md`

What it covers here:

- tracked git content scanned with `gitleaks`
- CodeQL scanning for JavaScript/TypeScript, Python, and workflow files
- generated license inventories for npm and Python dependencies
- SBOM artifacts for source and runner images
- private disclosure guidance

Why it matters:

- gives the template a security posture, not just security language
- catches mistakes before they become public problems
- useful across almost every software template category

Generic takeaway:

- secret scanning is a near-default for public repos
- CodeQL or equivalent static analysis is a strong baseline for maintained starters
- non-blocking license reporting is a good bridge before stricter allowlist enforcement
- SBOM generation is a strong supply-chain visibility layer for deployable templates

### 9. Workflow Linting

Files:

- `scripts/check-actionlint.mjs`
- `.github/workflows/template-ci.yml`

Why it matters:

- GitHub Actions workflows are code
- broken automation is still broken product infrastructure
- catches invalid workflow logic before GitHub becomes the first parser

Generic takeaway:

- if a repo relies on Actions, lint the workflows

### 10. Post-Release Smoke Testing

Files:

- `scripts/check-release-smoke.mjs`
- `.github/workflows/release-smoke.yml`

Why it matters:

- verifies the published artifact, not just the source tree
- catches image/runtime/config mistakes that CI build checks can miss

Generic takeaway:

- this is one of the highest-leverage "mature repo" features
- especially useful when templates publish packages, Docker images, CLIs, or starter deployables

### 11. Golden Fixtures and Snapshot-Style Verification

Files:

- `backend/tests/fixtures/*`
- `backend/tests/snapshots/*`

Why it matters:

- helps protect behavior, not just types
- gives a stable baseline for regressions
- extremely reusable across domains

Generic takeaway:

- any template with meaningful outputs should consider fixtures or snapshots
- examples:
  - API responses
  - generated files
  - CLI output
  - UI screenshots
  - transformed documents

### 12. Docs-Preview or Screenshot Routes

Files:

- `frontend/src/app/docs-preview/*`
- `docs/assets/*`

Why it matters:

- keeps screenshots reproducible
- avoids random one-off marketing assets
- helps the README stay current

Generic takeaway:

- if the template has a UI, add a stable docs-preview path for screenshots and demos

## What Is Specific To This Repo

These parts should not be copied blindly into other templates:

- detection-first positioning
- segmentation and webcam flows
- OpenCV sample pipelines
- computer-vision API schemas and fixtures
- CV-specific screenshots and product copy

These are template-independent patterns, but the current implementation is CV-shaped:

- OpenAPI as source of truth
- upload-to-inference UX
- fixture-based regression testing
- annotated-preview docs screenshots

## What I Would Reuse In Almost Any Future Template

If you want a high-value default stack for other starters, I would reuse this set first:

1. `README.md`
2. `CONTRIBUTING.md`
3. `AGENTS.md`
4. `SECURITY.md`
5. root `dev` and `check` scripts
6. split CI
7. workflow lint
8. secret scan
9. release drafter
10. release workflow
11. release smoke workflow
12. issue templates
13. PR template
14. CODEOWNERS
15. Dependabot

That set already makes a repo feel much more "template-ready" and much less "personal experiment."

## Suggested Template Blueprint For Other Projects

For future non-CV starters, I would preserve this rough shape:

### Foundation

- strong README
- contributor guide
- security policy
- agent guidance
- roadmap file

### Local DX

- root `dev`
- root `check`
- focused helper scripts
- reproducible screenshots or docs previews if there is UI

### CI

- workflow lint
- secret scan
- app/test/build verification
- platform-specific verification if relevant
- Docker or packaging check if deployable

### Release Layer

- release drafter
- label sync
- semver labeling rules
- publish workflow
- smoke test after publish

### Governance

- CODEOWNERS
- issue templates
- PR template
- Dependabot

## Minimal Version Vs Full Version

If you want a lighter template, keep at least:

- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- root `dev`
- root `check`
- split CI
- secret scan
- release workflow

If you want the fuller "public template that ages well" version, also keep:

- `AGENTS.md`
- workflow lint
- label sync
- release drafter
- release smoke tests
- CODEOWNERS
- issue templates
- Dependabot
- CodeQL

## Personal Recommendation

For future templates, think in this order:

1. clear product story
2. clear repo ergonomics
3. clear verification
4. clear release path
5. clear maintainer workflow

That order matters. Good code alone does not make a good starter template. A reusable template needs to be understandable, verifiable, and maintainable by someone who did not build it first.
