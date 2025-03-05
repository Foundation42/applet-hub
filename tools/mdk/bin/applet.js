#!/usr/bin/env node

import { Command } from 'commander';
import { createModule, startDevServer } from '../dist/index.js';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';

// Create CLI program
const program = new Command();

// Set version from package.json
const packageJsonPath = path.resolve(path.dirname(import.meta.url.slice(7)), '../package.json');
const { version } = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

program
  .name('applet')
  .description('AppletHub Module Development Kit CLI')
  .version(version);

// Create module command
program
  .command('create')
  .description('Create a new module from a template')
  .argument('<name>', 'module name')
  .option('-t, --type <type>', 'module template type (basic-module, ui-module, etc.)')
  .option('-d, --description <description>', 'module description')
  .option('--destination <path>', 'destination directory')
  .action((name, options) => {
    createModule(name, options);
  });

// Development server command
program
  .command('dev')
  .description('Start the development server')
  .option('-p, --port <port>', 'port to listen on', '3000')
  .option('-m, --modules <modules...>', 'modules to load')
  .option('--no-watch', 'disable watch mode')
  .action((options) => {
    startDevServer({
      port: parseInt(options.port),
      modules: options.modules,
      watch: options.watch
    });
  });

// Display help if no arguments provided
if (process.argv.length === 2) {
  program.help();
}

// Parse arguments
program.parse();