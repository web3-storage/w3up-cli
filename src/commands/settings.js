import ora from 'ora';
import Inquirer from 'inquirer';
import fs from 'fs';

/**
 * @async
 * @param {object} options
 * @param {Map<string, any>} options.settings - The settings to overwrite
 * @param {string} options.fileName - The name of the file to import
 * @returns {Promise<void>}
 */
export async function importSettings({ settings, fileName }) {
  if (!fs.existsSync(fileName)) {
    console.log(`${fileName} does not exist.`);
    return;
  }
  const view = ora('export');
  view.stopAndPersist({
    text: 'These values will overwrite your old id/account and you will lose access, are you sure you want to proceed?',
  });

  const { show } = await Inquirer.prompt({
    name: 'show',
    type: 'confirm',
  });

  if (show && fileName) {
    try {
      const str = fs.readFileSync(fileName, { encoding: 'utf-8' });
      const obj = JSON.parse(str);
      console.log(obj);

      if (obj) {
        for (var key of Object.keys(obj)) {
          if (key == 'secret') {
            const secret = Uint8Array.from(Buffer.from(obj.secret, 'base64'));
            settings.set(key, secret);
          } else {
            settings.set(key, obj[key]);
          }
        }
      }
    } catch (err) {
      console.log('err', err);
    }
  }
}

/**
 * @async
 * @param {object} options
 * @param {Map<string, any>} options.settings - The settings to export
 * @returns {Promise<void>}
 */
export async function exportSettings({ settings }) {
  const view = ora('export');
  view.stopAndPersist({
    text: 'These values give anyone the power to act as you, are you sure you want to print them?',
  });

  const { show } = await Inquirer.prompt({
    name: 'show',
    type: 'confirm',
  });

  if (show) {
    const store = settings.store;
    if (store.secret) {
      store.secret = Buffer.from(store.secret).toString('base64');
    }
    console.log(store);
  } else {
    console.log('exiting');
  }
}
