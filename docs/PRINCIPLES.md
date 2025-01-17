# Development Principles

## Type System
1. **No Type Duplication**
   - Types should be defined once and imported where needed
   - If you need to modify an existing type, create a new type extending the base one
   - All core types should be defined in the shared module to ensure consistency
   - When possible, use TypeScript's utility types (Pick, Omit, etc.) to derive new types

## Code Organization
1. **Minimize Code Changes**
   - Prefer changing code that uses a function over changing the function itself
   - Make minimal necessary changes to fix issues
   - Keep old code unless there is a compelling reason to remove it

## MVP Development
1. **Focus on Core Functionality**
   - Prioritize key features that demonstrate project capabilities
   - Temporarily sacrifice:
     - Complex error handling
     - Edge cases
     - Extensive testing
     - Perfect architecture
   - Focus on development speed and minimal new code
   - Only implement what is absolutely necessary

## Version Control
1. **Atomic Commits**
   - Each commit should represent one logical change
   - Wait for test confirmation before fixing other issues
   - Carefully review changes before committing
   - Keep documentation in sync with code changes

## Interface Changes
1. **Maintain Consistency**
   - Check documentation when interfaces don't match
   - Update all related code when changing interfaces
   - Verify all usage points when modifying function signatures