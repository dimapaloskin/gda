#!/usr/bin/env node

const git = require('simple-git')(process.cwd());
const inquirer = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
const execa = require('execa');

inquirer.registerPrompt('autocomplete', autocomplete);

git.status(async (err, status) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const files = status.modified.concat(status.not_added);

  if (!files.length) {
    console.log('No files');
    process.exit(0);
  }

  try {
    const { file } = await inquirer.prompt({
      type: 'autocomplete',
      name: 'file',
      message: 'Select file',
      source: async (answersSoFar, input) => {
        if (!input) {
          input = '';
        }

        const files = status.modified.concat(status.not_added);
        const filtered = files.filter(file => {
          return file.includes(input);
        });

        return filtered;
      }
    });


    await execa.shell(`git diff ${file}`, { stdio: 'inherit' });
    const { needAdd } = await inquirer.prompt({
      type: 'list',
      name: 'needAdd',
      message: 'Add?',
      choices: ['Yes', 'No']
    });

    if (needAdd === 'Yes') {
      await execa.shell(`git add ${file}`, { stdio: 'inherit' });
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

});
