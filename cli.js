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

  try {
    const { file } = await inquirer.prompt({
      type: 'list',
      name: 'file',
      message: 'Select file',
      choices: status.modified.concat(status.not_added) // TODO: normilizer
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
