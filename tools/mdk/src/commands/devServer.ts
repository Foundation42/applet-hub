// devServer.ts - Development server for testing modules

import chalk from 'chalk';
import path from 'path';
import { spawn } from 'child_process';

interface DevServerOptions {
  port?: number;
  modules?: string[];
  watch?: boolean;
}

/**
 * Start a development server for testing modules
 */
export async function startDevServer(options: DevServerOptions = {}): Promise<void> {
  try {
    const port = options.port || 3000;
    const watch = options.watch !== false;
    
    console.log(chalk.blue('Starting AppletHub development server...'));
    console.log(chalk.gray(`Port: ${port}`));
    console.log(chalk.gray(`Watch mode: ${watch ? 'enabled' : 'disabled'}`));
    
    if (options.modules && options.modules.length > 0) {
      console.log(chalk.gray(`Modules: ${options.modules.join(', ')}`));
    }
    
    // For now, just run the main index.ts file with Bun
    // In a real implementation, we would have a more sophisticated
    // dev server with hot reloading and module isolation
    
    const bunArgs = ['run'];
    
    if (watch) {
      bunArgs.push('--watch');
    }
    
    bunArgs.push('index.ts');
    
    if (options.modules && options.modules.length > 0) {
      bunArgs.push('--modules', ...options.modules);
    }
    
    console.log(chalk.gray(`Running: bun ${bunArgs.join(' ')}`));
    
    const proc = spawn('bun', bunArgs, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PORT: port.toString(),
      },
    });
    
    proc.on('error', (error) => {
      console.error(chalk.red('Error starting development server:'), error);
    });
    
    // Handle termination signals
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, () => {
        if (proc) {
          proc.kill(signal);
        }
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error(chalk.red('Error starting development server:'), error);
  }
}