# Pull request checklist — MediaFlow Studios

## Summary

<!-- What changed and why (business / architecture impact) -->

## Type of change

- [ ] Feature (DAM product)
- [ ] Infrastructure / Terraform
- [ ] Security / DevSecOps
- [ ] Observability
- [ ] Documentation (ADR / runbook / FinOps)
- [ ] Chore (deps, formatting)

## Checklist

- [ ] `pre-commit run --all-files` passes locally (or CI equivalent)
- [ ] No secrets committed (Gitleaks clean)
- [ ] Terraform fmt / validate considered
- [ ] Security scan findings reviewed (tfsec / Checkov)
- [ ] Module READMEs updated if inputs/outputs changed (`terraform-docs`)
- [ ] Well-Architected tradeoffs noted if this is an architectural change
