#!/usr/bin/env node
const createProject = require('../lib/create-project').default

// First two args will be node and benzed-new
const args = process.argv.splice(2)

createProject(args)
