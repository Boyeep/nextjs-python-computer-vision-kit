# Template Playbook

Short reusable playbook for building a serious starter repo, even when the product domain changes.

Use this when you want to create a new template and need the internal structure, not the app-specific features.

## Goal

Every good template should be:

- easy to understand
- easy to run
- easy to verify
- easy to release
- easy to maintain

If a template only has code and no repo workflow, it is usually still a prototype.

## Keep These By Default

### Docs

- `README.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `AGENTS.md` or equivalent internal guidance
- short roadmap file like `soon.md`

### Root Commands

- `dev`
- `check`
- `check:contract` if generated artifacts exist
- `check:images` if the repo ships deployable containers
- `check:workflows`
- `check:secrets`
- `report:licenses` if the repo has third-party dependencies worth auditing

### CI

- workflow lint
- secret scan
- dependency review on pull requests
- SBOM generation for source or publishable artifacts when relevant
- app verification
- cross-platform check if relevant
- packaging or Docker build check if relevant

### Release Layer

- release drafter
- semver labels
- label sync
- publish workflow
- provenance attestations for published artifacts when possible
- release smoke test

### Repo Governance

- `CODEOWNERS`
- PR template
- issue templates
- Dependabot

## Recommended File Set

For a strong public starter, this is a good baseline:

```text
README.md
CONTRIBUTING.md
SECURITY.md
AGENTS.md
soon.md
.github/CODEOWNERS
.github/dependabot.yml
.github/pull_request_template.md
.github/ISSUE_TEMPLATE/*
.github/release-drafter.yml
.github/labels.json
.github/dependency-review-config.yml
.github/workflows/template-ci.yml
.github/workflows/dependency-review.yml
.github/workflows/release-drafter.yml
.github/workflows/release.yml
.github/workflows/release-smoke.yml
.github/workflows/sbom.yml
.github/workflows/sync-labels.yml
.github/workflows/codeql.yml
scripts/dev.mjs
scripts/check.mjs
scripts/check-actionlint.mjs
scripts/check-secrets.mjs
scripts/report-licenses.mjs
```

Add these if relevant:

```text
scripts/check-contract-drift.mjs
scripts/check-docker-builds.mjs
scripts/check-release-smoke.mjs
docs/assets/*
docs/openapi.yaml
```

## Build Order

When creating a new template, build it in this order:

1. define the product story
2. create the repo structure
3. add root `dev` and `check`
4. add contributor docs
5. add split CI
6. add release automation
7. add governance files
8. add security scanning
9. add smoke testing for published artifacts

This order prevents the repo from becoming code-heavy but maintenance-light.

## Minimum Viable Template

If you want the lean version, keep at least:

- README
- CONTRIBUTING
- SECURITY
- root `dev`
- root `check`
- split CI
- secret scanning
- release workflow

This is the minimum point where a repo starts feeling dependable.

## Full Public Template

If you want the version that scales better for open source or long-term reuse, also add:

- agent guidance
- workflow lint
- CodeQL
- label sync
- release drafter
- release smoke tests
- CODEOWNERS
- issue templates
- Dependabot

## Generic Rules Worth Reusing

- one source of truth for contracts
- generated files should have drift checks
- local scripts and CI should use the same commands
- published artifacts should get smoke-tested
- workflows should be linted
- secrets should be scanned
- dependency changes should be reviewed on pull requests
- dependency licenses should be reportable without manual digging
- SBOMs should be generated for source trees or release artifacts when supply-chain visibility matters
- published artifacts should have provenance attestations when the platform supports them
- release steps should be automated
- docs should explain maintainer flow, not just user setup

## What To Customize Per New Project

Do not copy these blindly from one template to another:

- product copy
- screenshots
- sample data
- domain-specific API schemas
- domain-specific tests
- domain-specific fixtures
- domain-specific feature names

Keep the infrastructure, change the story.

## Good Default Questions For Any New Template

Before calling a template "done," ask:

1. Can a new person run it quickly?
2. Can a contributor verify changes with one or two commands?
3. Can CI explain exactly what broke?
4. Can maintainers cut a release without manual chaos?
5. Can the published artifact be smoke-tested?
6. Is there a security reporting path?
7. Are repo ownership and contribution expectations visible?

If the answer to several of these is no, the template probably still needs internal work.

## Personal Default Stack

If I were starting another template tomorrow, I would copy this pattern first:

1. root scripts
2. split CI
3. release automation
4. security scanning
5. governance files
6. contributor and agent docs

Then I would build the domain-specific product layer on top.
