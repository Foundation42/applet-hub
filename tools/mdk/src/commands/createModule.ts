// createModule.ts - Command for creating new modules

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { processTemplateDirectory, getAvailableTemplates } from '../utils/template.js';

interface CreateModuleOptions {
  type?: string;
  description?: string;
  destination?: string;
}

/**
 * Create a new module from a template
 */
export async function createModule(
  name: string,
  options: CreateModuleOptions = {}
): Promise<void> {
  try {
    // Normalize module name and generate ID
    const moduleId = name.toLowerCase().replace(/\s+/g, '-');
    const moduleName = name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Get template directory path
    const templatesDir = path.resolve(
      process.cwd(),
      'tools/mdk/templates'
    );
    
    // Get available templates
    const availableTemplates = await getAvailableTemplates(templatesDir);
    
    if (availableTemplates.length === 0) {
      console.error(chalk.red('No templates found. Make sure the templates directory exists.'));
      return;
    }
    
    // If template type is not provided, ask for it
    let templateType = options.type;
    if (!templateType) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'templateType',
          message: 'Select a module template:',
          choices: availableTemplates
        }
      ]);
      templateType = answers.templateType;
    } else if (!availableTemplates.includes(templateType)) {
      console.error(chalk.red(`Template type "${templateType}" not found.`));
      console.log(chalk.yellow(`Available templates: ${availableTemplates.join(', ')}`));
      return;
    }
    
    // Get module description
    let moduleDescription = options.description;
    if (!moduleDescription) {
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'description',
          message: 'Enter module description:',
          default: `${moduleName} module for AppletHub`
        }
      ]);
      moduleDescription = answers.description;
    }
    
    // Get destination directory
    let destinationDir = options.destination;
    if (!destinationDir) {
      destinationDir = path.resolve(process.cwd(), 'src', moduleId);
    } else {
      destinationDir = path.resolve(process.cwd(), destinationDir, moduleId);
    }
    
    // Check if the destination directory already exists
    if (await fs.pathExists(destinationDir)) {
      const answers = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `Module directory already exists at ${destinationDir}. Overwrite?`,
          default: false
        }
      ]);
      
      if (!answers.overwrite) {
        console.log(chalk.yellow('Module creation cancelled.'));
        return;
      }
    }
    
    // Create the module from the template
    console.log(chalk.blue(`Creating ${templateType} module: ${moduleName}`));
    
    const templateDir = path.join(templatesDir, templateType || '');
    await processTemplateDirectory(templateDir, destinationDir, {
      moduleId,
      moduleName,
      moduleDescription: moduleDescription || `${moduleName} module for AppletHub`
    });
    
    console.log(chalk.green(`Module created successfully at ${destinationDir}`));
    console.log('');
    console.log(chalk.yellow('Next steps:'));
    console.log('1. Review the generated module files');
    console.log(`2. Customize the module according to your needs`);
    console.log(`3. Run 'applet dev' to test your module`);
    
  } catch (error) {
    console.error(chalk.red('Error creating module:'), error);
  }
}