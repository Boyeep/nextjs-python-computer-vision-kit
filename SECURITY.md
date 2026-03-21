# Security Policy

## Supported Versions

This repository is a starter template, so security fixes are generally applied to the
latest version on `main`.

## Reporting A Vulnerability

Please do not open a public issue for sensitive security reports.

Use GitHub security advisories for private disclosure:

`https://github.com/Boyeep/nextjs-python-computer-vision-kit/security/advisories/new`

If the issue is not sensitive and is more of a hardening or best-practice improvement,
you can open a normal issue instead.

## Scope Notes

Useful reports include:

- dependency vulnerabilities in the shipped template
- insecure default configuration in frontend, backend, or Docker files
- unsafe upload handling or API behavior
- secrets exposure in docs, scripts, or CI

## Built-In Scanning

The repository also uses automated scanning to help catch common security issues:

- `gitleaks` in CI for tracked git content
- CodeQL code scanning on GitHub for JavaScript/TypeScript, Python, and workflow files
- GitHub dependency review on pull requests for newly introduced vulnerable dependency changes
- GitHub license-report artifacts for npm and Python dependency inventories
- GitHub SBOM artifacts for the repository source and runner images

Dependency review is also configured with an allowlist that matches the current dependency tree, so changes that introduce new license types are surfaced deliberately instead of silently drifting in.

Those checks do not replace private disclosure. If you believe a vulnerability is real or
exploitable, please still report it through a private advisory.

Reports that depend entirely on downstream customizations may still be useful, but they
may be treated as template hardening suggestions rather than direct vulnerabilities.
