/**
 * Environment Setup for Tests
 *
 * This file MUST be loaded first before any other imports.
 * It loads the .env.test file and sets environment variables.
 */
import { config } from 'dotenv';
import path from 'path';

// Load test environment variables BEFORE anything else
config({ path: path.resolve(process.cwd(), 'apps/api/.env.test') });

// Ensure NODE_ENV is set to test
process.env.NODE_ENV = 'test';
