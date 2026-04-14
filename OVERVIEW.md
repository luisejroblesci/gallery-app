# Repository Overview

## What This Repository Does

This repository serves as a **test bed for automated flaky test detection and fixing systems**. It combines a simple web application (a mountaineering photography landing page) with a comprehensive suite of intentionally flaky tests to evaluate and challenge AI agents and automated testing tools.

## Primary Purpose

**Testing Automated Test-Fixing Agents**: The repository contains 44 carefully crafted flaky tests that represent common real-world flakiness patterns. These tests are designed to challenge automated systems that attempt to:
- Detect flaky test patterns
- Categorize types of test flakiness
- Propose and implement fixes
- Verify fixes maintain test integrity

## Repository Components

### 1. Web Application (Gallery App)
A functional mountaineering photography landing page featuring:
- Modern responsive design
- Interactive gallery with filtering
- Contact forms and animations
- Parallax effects and smooth scrolling

**Tech Stack**: Pure HTML, CSS, and JavaScript (no frameworks)

### 2. Flaky Test Suite
44 intentionally flaky tests organized into 6 categories:
- **Timing-Based** (5 tests): Race conditions, async timing, animation dependencies
- **DOM-Dependent** (5 tests): Element availability, rendering timing, mutations
- **Randomness-Based** (8 tests): Math.random(), date/time, probability outcomes
- **Network-Dependent** (6 tests): API timing, concurrent requests, retries
- **Memory/State Pollution** (10 tests): Shared state, cleanup issues, leaks
- **Environment-Dependent** (10 tests): Browser, OS, hardware variations

### 3. CI/CD Pipeline
**CircleCI Integration**: Automated testing pipeline that runs the flaky test suite on every push, providing:
- Test execution in controlled environments
- Test result reporting with JUnit format
- Integration with version control workflows

## Key Features

### High Flakiness Rate
Tests are calibrated to fail approximately **60%+ of the time**, making them:
- Easy to observe in CI/CD pipelines
- Challenging for detection systems
- Realistic to production flaky test scenarios

### Diverse Flakiness Patterns
The suite covers all major categories of flakiness found in real-world applications:
- Timing and synchronization issues
- Non-deterministic behavior
- State management problems
- External dependencies
- Environment-specific failures

### Real-World Scenarios
Each test represents actual patterns found in production codebases, not artificial or trivial examples.

## Use Cases

### 1. Agent Testing
Evaluate AI agents that claim to:
- Automatically detect flaky tests
- Fix flaky tests without human intervention
- Improve CI/CD reliability

### 2. Tool Development
Test and benchmark automated testing tools:
- Flaky test detection algorithms
- Test stabilization frameworks
- CI/CD optimization tools

### 3. Educational Purposes
Learn about:
- Common flaky test anti-patterns
- Best practices for deterministic testing
- Test cleanup and isolation techniques

### 4. Research
Study automated test repair approaches:
- Pattern recognition in test code
- Fix suggestion accuracy
- Impact on test coverage and intent

## How to Use This Repository

### Run the Tests
```bash
# Install dependencies
npm install

# Run all tests (observe flakiness)
npm test

# Run only flaky tests
npm run test:flaky

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Deploy the Web App
```bash
# Serve locally
npm run serve
# Visit http://localhost:8000
```

### CI/CD Integration
The repository includes CircleCI configuration that automatically:
- Installs dependencies
- Runs the full test suite
- Reports test results
- Demonstrates flaky test behavior in CI

## Expected Outcomes

### For Automated Agents
A successful agent should:
1. Identify all 44 flaky tests
2. Correctly categorize the type of flakiness
3. Propose appropriate fixes (proper waiting, mocking, cleanup)
4. Implement fixes that make tests deterministic
5. Preserve original test intent and coverage

### Success Metrics
- **Detection Rate**: Percentage of flaky tests identified
- **Fix Accuracy**: Percentage of tests fixed correctly
- **False Positives**: Stable tests incorrectly flagged
- **Test Intent Preservation**: Fixes maintain original test purpose

## Documentation

- **README.md**: Detailed guide for the web application
- **FLAKY_TESTS_README.md**: Comprehensive flaky test documentation
- **OVERVIEW.md** (this file): High-level repository purpose and usage

## Technical Details

**Testing Framework**: Jest with jsdom environment
**CI/CD Platform**: CircleCI
**Language**: JavaScript
**Package Manager**: npm/yarn
**Node Version**: Compatible with Node.js 14+

## Contributing

This repository is designed for testing automated systems. The flaky tests are intentionally broken and should remain that way to serve their purpose as test subjects for automated repair systems.

## License

MIT License - See package.json for details

---

**Summary**: This repository is a specialized testing ground for evaluating automated flaky test detection and fixing systems, combining a real web application with a comprehensive suite of intentionally flaky tests that represent common real-world testing challenges.
