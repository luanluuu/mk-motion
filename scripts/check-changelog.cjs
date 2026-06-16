#!/usr/bin/env node
/**
 * Release guard: ensure CHANGELOG.md contains an entry for the current
 * package.json version before publishing.
 */

const fs = require('fs')
const path = require('path')

const pkgPath = path.join(__dirname, '..', 'package.json')
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md')

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const version = pkg.version

if (!version) {
  console.error('[changelog:check] Could not read version from package.json')
  process.exit(1)
}

const changelog = fs.readFileSync(changelogPath, 'utf8')
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const pattern = new RegExp(`^##\\s*\\[${escaped}\\]`, 'm')

if (!pattern.test(changelog)) {
  console.error(
    `[changelog:check] CHANGELOG.md is missing an entry for version ${version}`
  )
  process.exit(1)
}

console.log(`[changelog:check] Found entry for version ${version}`)
