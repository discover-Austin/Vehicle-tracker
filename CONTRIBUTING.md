# Contributing to Vehicle Tracking System

Thank you for considering contributing to the Vehicle Tracking System! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. **Clear title** - Describe the bug briefly
2. **Description** - Detailed explanation of the problem
3. **Steps to reproduce** - How to trigger the bug
4. **Expected behavior** - What should happen
5. **Actual behavior** - What actually happens
6. **Environment** - OS, Node version, etc.
7. **Screenshots** - If applicable

### Suggesting Features

Feature requests are welcome! Please include:

1. **Use case** - Why is this feature needed?
2. **Proposed solution** - How should it work?
3. **Alternatives** - Other approaches you've considered
4. **Additional context** - Any other relevant information

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments where necessary
   - Update documentation

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add: Brief description of changes"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide a clear title and description
   - Reference any related issues
   - Explain what changed and why

## Development Guidelines

### Code Style

- Use **2 spaces** for indentation
- Use **camelCase** for variables and functions
- Use **PascalCase** for classes
- Use **UPPER_CASE** for constants
- Keep lines under **100 characters** when possible

### Commit Messages

Follow this format:

```
Type: Brief description

Detailed explanation of changes (if needed)
```

**Types:**
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Changes to existing features
- `Refactor:` Code restructuring
- `Docs:` Documentation changes
- `Test:` Adding or updating tests
- `Style:` Formatting changes

**Examples:**
```
Add: User profile page with settings

Fix: Authentication token expiration issue

Update: Improve detection algorithm accuracy

Refactor: Simplify database query logic

Docs: Add API documentation for export endpoints

Test: Add unit tests for camera routes

Style: Format code according to style guide
```

### Testing

All new features should include tests:

```javascript
describe('Feature Name', () => {
  test('should do something specific', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await someFunction(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

Run tests before submitting:
```bash
npm test
```

### Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying configuration options
- Adding dependencies

Update these files as needed:
- `README.md` - Main documentation
- `API.md` - API reference
- Code comments - Inline documentation

## Project Structure

```
Vehicle-tracker/
├── server/           # Backend code
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   ├── middleware/  # Express middleware
│   └── database/    # Database setup
├── public/          # Frontend code
│   ├── js/         # JavaScript files
│   └── css/        # Stylesheets
└── tests/          # Test files
```

## Setting Up Development Environment

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Vehicle-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Initialize database**
   ```bash
   npm run init-db
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Backend Development

### Adding New API Endpoints

1. Create route handler in `server/routes/`
2. Add route to `server/index.js`
3. Update `API.md` documentation
4. Add tests in `tests/`

Example:
```javascript
// server/routes/example.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, (req, res) => {
  // Your logic here
  res.json({ message: 'Success' });
});

module.exports = router;
```

### Database Changes

When modifying the database schema:

1. Update `server/database/init.js`
2. Create migration script if needed
3. Document changes in commit message
4. Update related models/queries

## Frontend Development

### Adding New Pages

1. Create HTML file in `public/`
2. Use existing API client (`public/js/api.js`)
3. Follow Tailwind CSS conventions
4. Ensure responsive design

### Using the API Client

```javascript
const api = new VehicleTrackerAPI();

// Login
await api.login('username', 'password');

// Make authenticated requests
const { cameras } = await api.getCameras();
```

## Security Guidelines

- **Never commit secrets** - Use environment variables
- **Validate all inputs** - Server and client side
- **Use parameterized queries** - Prevent SQL injection
- **Hash passwords** - Use bcrypt
- **Implement rate limiting** - Prevent abuse
- **Use HTTPS** - In production
- **Sanitize user input** - Prevent XSS

## Performance Guidelines

- **Optimize database queries** - Use indexes
- **Minimize API calls** - Batch when possible
- **Cache when appropriate** - Reduce redundant work
- **Compress responses** - Enable gzip
- **Lazy load resources** - Load on demand

## Questions?

If you have questions about contributing:

1. Check existing issues and documentation
2. Create a new issue with your question
3. Tag it as `question`

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Vehicle Tracking System!
