# 📦 Publishing to npm

## ✅ Pre-Publish Checklist

- [x] Package name is scoped: `jawa-framework`
- [x] Version is set: `1.0.0`
- [x] README.md is clean and complete
- [x] LICENSE file exists
- [x] Repository URL in package.json
- [x] Keywords for discoverability
- [x] All dependencies installed

## 🚀 Publishing Steps

### 1. Create npm Account

If you don't have an npm account yet:

```bash
# Visit: https://www.npmjs.com/signup
```

### 2. Login to npm

```bash
npm login
```

You'll be asked for:
- Username
- Password
- Email
- OTP (One-Time Password from email)

### 3. Test Package Locally

```bash
# Link package locally
npm link

# Test the CLI
jawa --version
jawa init test-project

# Unlink after testing
npm unlink -g jawa-framework
```

### 4. Publish to npm

```bash
# Make sure everything is committed
git status

# Publish (first time - public scoped package)
npm publish --access public

# For updates (after version bump)
npm publish
```

### 5. Verify Publication

```bash
# Check on npm
npm view jawa-framework

# Install globally to test
npm install -g jawa-framework

# Test the installed package
jawa --version
jawa init test-project
```

## 📝 Version Management

### Semantic Versioning

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Update Version

```bash
# Patch release (bug fixes)
npm version patch
# 1.0.0 → 1.0.1

# Minor release (new features)
npm version minor
# 1.0.0 → 1.1.0

# Major release (breaking changes)
npm version major
# 1.0.0 → 2.0.0

# Then publish
npm publish
```

## 🔄 Update Workflow

```bash
# 1. Make changes to code
git add .
git commit -m "feat: add new feature"

# 2. Bump version
npm version minor

# 3. Push to GitHub
git push --follow-tags

# 4. Publish to npm
npm publish

# 5. Verify
npm view jawa-framework
```

## 📊 After Publishing

### Installation for Users

```bash
# Global installation (recommended)
npm install -g jawa-framework

# Use the CLI
jawa init my-project
jawa run --loop=1 --user=1 --ramp=1
jawa report
```

### View Package on npm

```
https://www.npmjs.com/package/jawa-framework
```

### View Download Stats

```bash
npm view jawa-framework
```

## 🔐 Security

### 2FA (Two-Factor Authentication)

Enable 2FA for your npm account:

```bash
npm profile enable-2fa auth-and-writes
```

### Access Token

For CI/CD pipelines:

```bash
npm token create --read-only
```

## 🛠️ Troubleshooting

### Package Name Already Taken

```bash
# Use scoped package
@yourusername/package-name

# Or choose different name
jawa-jmeter
jmeter-jawa
jawa-cli
```

### Access Denied

```bash
# Make sure you're logged in
npm whoami

# Re-login if needed
npm logout
npm login
```

### Publish Failed

```bash
# Check npm registry
npm config get registry
# Should be: https://registry.npmjs.org/

# Force publish (if needed)
npm publish --force
```

## 📈 Package Maintenance

### Deprecate Version

```bash
npm deprecate jawa-framework@1.0.0 "Critical bug, please upgrade"
```

### Unpublish (within 72 hours)

```bash
npm unpublish jawa-framework@1.0.0
```

⚠️ **Warning:** Unpublishing is permanent and can break other projects!

## 🎉 Success!

After publishing, users can install your package:

```bash
npm install -g jawa-framework
```

And use it anywhere:

```bash
jawa init my-test
cd my-test
jawa run --loop=5 --user=10
jawa report
```

---

**Ready to publish?**

```bash
npm login
npm publish --access public
```

🚀 **Good luck!**
