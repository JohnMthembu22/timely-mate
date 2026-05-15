#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { validateEnv, getEnvDocumentation } from '../src/utils/envValidation';
import chalk from 'chalk';

const ENV_FILES = {
  development: '.env.development',
  staging: '.env.staging',
  production: '.env.production',
};

type Environment = keyof typeof ENV_FILES;

async function checkEnvFile(envFile: string): Promise<boolean> {
  try {
    await fs.access(envFile);
    return true;
  } catch {
    return false;
  }
}

async function createEnvFile(environment: Environment) {
  const templatePath = path.join(__dirname, `../env-templates/${environment}.template`);
  const targetPath = path.join(__dirname, '..', ENV_FILES[environment]);

  try {
    const template = await fs.readFile(templatePath, 'utf-8');
    await fs.writeFile(targetPath, template);
    console.log(chalk.green(`✓ Created ${ENV_FILES[environment]}`));
  } catch (error) {
    console.error(chalk.red(`✗ Failed to create ${ENV_FILES[environment]}`));
    console.error(error);
  }
}

async function validateEnvironment(environment: Environment) {
  const envFile = ENV_FILES[environment];
  const exists = await checkEnvFile(envFile);

  if (!exists) {
    console.log(chalk.yellow(`! ${envFile} does not exist`));
    const create = await askQuestion('Would you like to create it? (y/n) ');
    if (create.toLowerCase() === 'y') {
      await createEnvFile(environment);
    }
    return;
  }

  const result = validateEnv();

  if (result.isValid) {
    console.log(chalk.green(`✓ ${envFile} is valid`));
  } else {
    console.log(chalk.red(`✗ ${envFile} has errors:`));
    result.errors.forEach((error) => console.log(chalk.red(`  - ${error}`)));
  }

  if (result.warnings.length > 0) {
    console.log(chalk.yellow('\nWarnings:'));
    result.warnings.forEach((warning) => console.log(chalk.yellow(`  - ${warning}`)));
  }
}

function showDocumentation() {
  console.log(chalk.blue('\nEnvironment Variables Documentation:'));
  console.log(chalk.white(getEnvDocumentation()));
}

async function askQuestion(question: string): Promise<string> {
  const { createInterface } = await import('readline');
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = args[1] as Environment;

  switch (command) {
    case 'validate':
      if (!environment || !ENV_FILES[environment]) {
        console.log(chalk.red('Please specify a valid environment: development, staging, or production'));
        return;
      }
      await validateEnvironment(environment);
      break;

    case 'docs':
      showDocumentation();
      break;

    case 'create':
      if (!environment || !ENV_FILES[environment]) {
        console.log(chalk.red('Please specify a valid environment: development, staging, or production'));
        return;
      }
      await createEnvFile(environment);
      break;

    default:
      console.log(chalk.blue('\nEnvironment Manager Usage:'));
      console.log(chalk.white('\n  validate <environment>  Validate environment variables'));
      console.log(chalk.white('  create <environment>    Create environment file from template'));
      console.log(chalk.white('  docs                    Show environment variables documentation\n'));
      break;
  }
}

main().catch((error) => {
  console.error(chalk.red('An error occurred:'));
  console.error(error);
  process.exit(1);
}); 