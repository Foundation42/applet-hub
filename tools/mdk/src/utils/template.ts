// template.ts - Utilities for working with templates

import fs from 'fs-extra';
import path from 'path';

/**
 * Replace template placeholders in a file
 */
export async function processTemplateFile(
  filePath: string, 
  outputPath: string, 
  replacements: Record<string, string>
): Promise<void> {
  // Read the template file
  let content = await fs.readFile(filePath, 'utf8');
  
  // Replace all placeholders
  for (const [key, value] of Object.entries(replacements)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    content = content.replace(placeholder, value);
  }
  
  // Write the processed file
  await fs.ensureDir(path.dirname(outputPath));
  await fs.writeFile(outputPath, content, 'utf8');
}

/**
 * Copy and process a directory of template files
 */
export async function processTemplateDirectory(
  templateDir: string,
  outputDir: string,
  replacements: Record<string, string>
): Promise<void> {
  // Ensure the output directory exists
  await fs.ensureDir(outputDir);
  
  // Get all files in the template directory
  const files = await fs.readdir(templateDir);
  
  // Process each file or directory
  for (const file of files) {
    const templatePath = path.join(templateDir, file);
    const outputPath = path.join(outputDir, file);
    
    const stats = await fs.stat(templatePath);
    
    if (stats.isDirectory()) {
      // Recursively process subdirectories
      await processTemplateDirectory(templatePath, outputPath, replacements);
    } else {
      // Process individual files
      await processTemplateFile(templatePath, outputPath, replacements);
    }
  }
}

/**
 * Get available template types
 */
export async function getAvailableTemplates(templatesDir: string): Promise<string[]> {
  // Ensure the templates directory exists
  if (!await fs.pathExists(templatesDir)) {
    return [];
  }
  
  // Get all directories in the templates directory
  const entries = await fs.readdir(templatesDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}