#!/usr/bin/env node

// Dynamic Dredd configuration generator using environment variables
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const config = {
  reporter: process.env.DREDD_REPORTER || 'spec',
  'dry-run': process.env.DREDD_DRY_RUN === 'true' || null,
  hookfiles: process.env.DREDD_HOOKS_PATH || './tests/dredd-hooks.js',
  language: 'nodejs',
  'server-wait': parseInt(process.env.SERVER_WAIT_TIME) || 0,
  init: false,
  names: false,
  only: [],
  output: [],
  header: [],
  sorted: false,
  user: null,
  'inline-errors': false,
  details: true,
  method: [],
  color: true,
  loglevel: process.env.DREDD_LOG_LEVEL || 'warning',
  path: [],
  'hooks-worker-timeout': 10000,
  'hooks-worker-connect-timeout': 3000,
  'hooks-worker-connect-retry': 1000,
  'hooks-worker-after-connect-wait': 500,
  'hooks-worker-term-timeout': 10000,
  'hooks-worker-term-retry': 1000,
  'hooks-worker-handler-host': '127.0.0.1',
  'hooks-worker-handler-port': 61321,
  config: './dredd.yml',
  blueprint: process.env.OPENAPI_SCHEMA_PATH || './schemas/api-schema.yaml',
  endpoint: process.env.API_BASE_URL || 'http://localhost:3000',
  emitErrors: true
};

// Write the configuration to dredd.yml
const yaml = require('js-yaml');
const configYaml = yaml.dump(config);

fs.writeFileSync('dredd.yml', configYaml);

console.log('Generated dredd.yml with environment configuration:');
console.log(`- API Endpoint: ${config.endpoint}`);
console.log(`- Schema Path: ${config.blueprint}`);
console.log(`- Hooks Path: ${config.hookfiles}`);
console.log(`- Log Level: ${config.loglevel}`);
