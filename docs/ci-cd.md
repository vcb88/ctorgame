# CI/CD Pipeline Documentation

## Overview

The project uses GitHub Actions for continuous integration and deployment. The pipeline consists of several workflows that handle different aspects of the development lifecycle.

## Workflows

### 1. Continuous Integration (ci.yml)

Triggers on:
- Push to main and develop branches
- Pull requests to main and develop branches

Jobs:
- **Test**: Runs unit tests across multiple Node.js versions
  - Includes PostgreSQL and Redis services
  - Runs linting and type checking
  - Executes unit and integration tests
- **Coverage**: Tracks code coverage
  - Runs tests with coverage reporting
  - Uploads results to Codecov

### 2. Pull Request Check (pr-check.yml)

Triggers on:
- Opening a pull request
- Synchronizing a pull request
- Reopening a pull request

Jobs:
- **Validate**: Checks code quality
  - Code style verification
  - Linting
  - Type checking
  - Build verification
- **Security**: Runs security scans
  - Snyk vulnerability scan
  - OSSAR security analysis
- **Conventional Commits**: Ensures commit message format

### 3. Continuous Deployment (cd.yml)

Triggers on:
- Push to main branch
- Creating version tags

Jobs:
- **Build**: Creates production builds
  - Runs tests
  - Builds client and server
  - Creates artifacts
- **Docker**: Handles container images
  - Builds Docker images
  - Pushes to GitHub Container Registry
- **Deploy**: Manages deployment
  - Deploys to production environment
  - Updates running services
- **Notify**: Sends notifications
  - Reports deployment status to Slack

## Required Secrets

The following secrets need to be configured in GitHub repository settings:

- `GITHUB_TOKEN`: Automatically provided by GitHub
- `CODECOV_TOKEN`: For uploading coverage reports
- `SSH_PRIVATE_KEY`: For server deployment
- `DEPLOY_HOST`: Production server hostname
- `DEPLOY_USER`: SSH user for deployment
- `SLACK_WEBHOOK_URL`: For Slack notifications
- `SNYK_TOKEN`: For security scanning

## Commit Message Convention

The project follows the Conventional Commits specification. Commit messages must be structured as follows:

\```
type(scope): subject

body

footer
\```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Example:
\```
feat(auth): add user authentication

- Implement JWT token generation
- Add login and register endpoints
- Create authentication middleware

Closes #123
\```

## Development Flow

1. Create feature branch from develop
2. Make changes and commit following conventions
3. Open pull request to develop
4. Wait for CI checks to pass
5. Get code review approval
6. Merge to develop
7. Automated deployment to staging
8. Test in staging environment
9. Create release PR to main
10. Merge to main triggers production deployment

## Monitoring

- Code coverage tracked on Codecov
- Security vulnerabilities monitored by Snyk
- Deployment status notifications in Slack
- GitHub Actions dashboard for workflow status

## Troubleshooting

Common issues and solutions:

1. Failed tests:
   - Check test logs in GitHub Actions
   - Run tests locally with \`pnpm test\`

2. Failed deployment:
   - Verify all required secrets are set
   - Check SSH connection to deployment server
   - Verify Docker service status

3. Security scan failures:
   - Review Snyk security report
   - Update vulnerable dependencies
   - Apply security patches

4. Commit message rejections:
   - Follow commit message convention
   - Use \`git commit --amend\` to fix
   - Reference conventional commits documentation

## Maintenance

Regular maintenance tasks:

1. Update GitHub Actions versions
2. Review and update dependencies
3. Monitor CodeCov reports
4. Check Snyk security alerts
5. Verify deployment configurations
6. Update documentation

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org)
- [Codecov Documentation](https://docs.codecov.io)
- [Snyk Documentation](https://docs.snyk.io)