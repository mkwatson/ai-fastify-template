# SDK Versioning Strategy

This document outlines the comprehensive versioning strategy for the AI Fastify Template SDK, ensuring consistent, predictable releases that follow semantic versioning principles.

## Overview

The SDK is automatically generated from the API's OpenAPI specification using Fern. Version management follows semantic versioning (SemVer) principles with automated detection of breaking changes.

## Semantic Versioning (SemVer)

We follow [Semantic Versioning 2.0.0](https://semver.org/) specification:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes

## Version Detection Rules

### MAJOR Version (Breaking Changes)

A major version bump occurs when:

1. **Endpoint Removal**: Any existing endpoint is removed
2. **Required Parameter Addition**: New required parameters added to existing endpoints
3. **Response Structure Changes**: Changes to response object structure that break compatibility
4. **HTTP Method Changes**: Changing HTTP methods for existing endpoints
5. **Authentication Changes**: Changes to authentication requirements
6. **Data Type Changes**: Changing data types of existing fields (e.g., string → number)

**Examples:**

```yaml
# MAJOR: Removing an endpoint
- paths:
    /users/{id}:
      delete: # This endpoint was removed

# MAJOR: Adding required parameter
paths:
  /users:
    post:
      parameters:
        - name: tenantId  # New required parameter
          required: true
```

### MINOR Version (New Features)

A minor version bump occurs when:

1. **New Endpoints**: Adding new API endpoints
2. **Optional Parameters**: Adding optional parameters to existing endpoints
3. **New Response Fields**: Adding new fields to response objects (non-breaking)
4. **New HTTP Methods**: Adding new HTTP methods to existing paths
5. **Enhanced Error Responses**: Improving error response details without breaking existing structure

**Examples:**

```yaml
# MINOR: New endpoint
paths:
  /users/{id}/profile:  # New endpoint
    get:
      summary: Get user profile

# MINOR: Optional parameter
paths:
  /users:
    get:
      parameters:
        - name: filter  # New optional parameter
          required: false
```

### PATCH Version (Bug Fixes)

A patch version bump occurs when:

1. **Documentation Updates**: Improving descriptions, examples, or documentation
2. **Example Corrections**: Fixing incorrect examples in the OpenAPI spec
3. **Metadata Changes**: Updating titles, descriptions, or contact information
4. **Bug Fixes**: Correcting implementation bugs without API changes
5. **Internal Improvements**: Performance improvements or internal refactoring

**Examples:**

```yaml
# PATCH: Documentation improvement
paths:
  /users:
    get:
      summary: 'Retrieve users' # Improved description
      description: 'Get a paginated list of users with optional filtering' # Enhanced
```

## Automated Version Detection

### CI/CD Pipeline Integration

The versioning system integrates with GitHub Actions to automatically:

1. **Analyze Changes**: Compare current OpenAPI spec with previous version
2. **Detect Version Type**: Determine if changes are MAJOR, MINOR, or PATCH
3. **Update Package Version**: Automatically increment version in `package.json`
4. **Generate Changelog**: Create detailed changelog entries
5. **Tag Release**: Create Git tags for version tracking

### Change Detection Algorithm

```typescript
interface VersionChange {
  type: 'major' | 'minor' | 'patch';
  reason: string;
  details: string[];
}

function detectVersionChange(
  oldSpec: OpenAPI,
  newSpec: OpenAPI
): VersionChange {
  // 1. Check for breaking changes (MAJOR)
  const breakingChanges = detectBreakingChanges(oldSpec, newSpec);
  if (breakingChanges.length > 0) {
    return {
      type: 'major',
      reason: 'Breaking changes detected',
      details: breakingChanges,
    };
  }

  // 2. Check for new features (MINOR)
  const newFeatures = detectNewFeatures(oldSpec, newSpec);
  if (newFeatures.length > 0) {
    return {
      type: 'minor',
      reason: 'New features added',
      details: newFeatures,
    };
  }

  // 3. Default to patch for any other changes
  return {
    type: 'patch',
    reason: 'Documentation or bug fixes',
    details: ['Non-breaking improvements'],
  };
}
```

## Release Process

### 1. Development Phase

- Developers make changes to the API
- OpenAPI specification is updated automatically
- Changes are tracked in feature branches

### 2. Version Calculation

When changes are merged to main:

1. **Compare Specifications**: Current vs. previous OpenAPI spec
2. **Analyze Changes**: Categorize changes by impact level
3. **Calculate Version**: Apply SemVer rules to determine new version
4. **Validate**: Ensure version progression is logical

### 3. SDK Generation

1. **Generate SDK**: Fern creates new TypeScript SDK
2. **Update Metadata**: Package.json version updated
3. **Generate Changelog**: Detailed changes documented
4. **Create PR**: Automated pull request with SDK updates

### 4. Publication

1. **Review**: Manual review of generated SDK changes
2. **Approve**: Merge PR to trigger publication
3. **Publish**: NPM package published automatically
4. **Tag**: Git tag created for version tracking

## Pre-release Versions

For testing and development, we support pre-release versions:

### Alpha Releases

```
1.2.0-alpha.1
1.2.0-alpha.2
```

- Early development versions
- Potentially unstable
- For internal testing only

### Beta Releases

```
1.2.0-beta.1
1.2.0-beta.2
```

- Feature-complete but may have bugs
- External testing and feedback
- Release candidate preparation

### Release Candidates

```
1.2.0-rc.1
1.2.0-rc.2
```

- Final testing before release
- Production-ready candidates
- Minimal changes expected

## Compatibility Matrix

### SDK Version Support

| SDK Version | API Version | Node.js | TypeScript | Support Status |
| ----------- | ----------- | ------- | ---------- | -------------- |
| 2.x.x       | 2.x.x       | ≥18.0   | ≥4.9       | Active         |
| 1.x.x       | 1.x.x       | ≥16.0   | ≥4.7       | Maintenance    |

### Support Lifecycle

- **Active**: Full support, new features, bug fixes
- **Maintenance**: Critical bug fixes only, security updates
- **End of Life**: No further updates

## Migration Guidelines

### Breaking Change Communication

When major versions are released:

1. **Advance Notice**: 30-day notice for breaking changes
2. **Migration Guide**: Detailed upgrade instructions
3. **Deprecation Warnings**: Clear deprecation notices in previous versions
4. **Support Period**: Extended support for previous major version

### Example Migration Guide

````markdown
# Migrating from v1.x to v2.x

## Breaking Changes

### 1. Authentication Changes

**Before (v1.x):**

```typescript
const client = new AiFastifyTemplateAPI({
  apiKey: 'your-key',
});
```
````

**After (v2.x):**

```typescript
const client = new AiFastifyTemplateAPI({
  authentication: {
    scheme: 'bearer',
    token: 'your-token',
  },
});
```

### 2. Response Format Changes

**Before (v1.x):**

```typescript
interface UserResponse {
  user: User;
}
```

**After (v2.x):**

```typescript
interface UserResponse {
  data: User;
  meta: {
    version: string;
  };
}
```

```

## Tools and Automation

### Version Detection Tools

1. **OpenAPI Diff**: Compare specifications for changes
2. **Breaking Change Detector**: Identify compatibility issues
3. **Changelog Generator**: Create detailed release notes
4. **Version Calculator**: Determine appropriate version bump

### GitHub Actions Workflows

1. **Version Detection**: `.github/workflows/version-detection.yml`
2. **SDK Generation**: `.github/workflows/sdk-generation.yml`
3. **Release Publishing**: `.github/workflows/release.yml`
4. **Compatibility Testing**: `.github/workflows/compatibility.yml`

## Monitoring and Metrics

### SDK Usage Tracking

- Download statistics from NPM
- Version adoption rates
- Error reporting and analytics
- Performance metrics

### Quality Metrics

- Breaking change frequency
- Time between releases
- Issue resolution time
- User satisfaction scores

## Emergency Procedures

### Hotfix Process

For critical security or bug fixes:

1. **Immediate Patch**: Create patch version quickly
2. **Expedited Review**: Fast-track approval process
3. **Emergency Release**: Bypass normal release schedule
4. **Communication**: Notify users of critical updates

### Rollback Procedures

If a release causes issues:

1. **Immediate Assessment**: Evaluate impact and scope
2. **Version Deprecation**: Mark problematic version as deprecated
3. **Patch Release**: Create fix version quickly
4. **Communication**: Clear communication to users

## Best Practices

### For API Developers

1. **Design for Backwards Compatibility**: Avoid breaking changes when possible
2. **Use Deprecation**: Mark features as deprecated before removal
3. **Version Documentation**: Keep OpenAPI specs accurate and complete
4. **Test Thoroughly**: Validate changes before release

### For SDK Consumers

1. **Pin Versions**: Use specific versions in production
2. **Test Updates**: Validate new versions in staging
3. **Monitor Releases**: Subscribe to release notifications
4. **Follow Migration Guides**: Use provided upgrade instructions

## Future Enhancements

### Planned Improvements

1. **Automated Testing**: SDK compatibility testing across versions
2. **Performance Benchmarking**: Track SDK performance over time
3. **Multi-language Support**: Extend versioning to other SDK languages
4. **Advanced Analytics**: Detailed usage and adoption metrics

### Research Areas

1. **AI-Powered Change Detection**: Machine learning for impact analysis
2. **Predictive Versioning**: Anticipate breaking changes
3. **Dynamic Compatibility**: Runtime compatibility checking
4. **Zero-Downtime Migrations**: Seamless version transitions

---

This versioning strategy ensures that SDK users can confidently upgrade while maintaining stability and predictability in their applications. The automated approach reduces manual effort while providing comprehensive tracking and communication of changes.
```
