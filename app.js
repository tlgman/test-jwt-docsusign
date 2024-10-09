import inquirer from 'inquirer';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const currentTimestamp = Math.floor(Date.now() / 1000);
const nextYearTimestamp = currentTimestamp + 365 * 24 * 60 * 60;

async function generateWebToken() {
  const questions = [
    {
      type: 'input',
      name: 'privateKeyPath',
      message: 'Enter the path to the RSA private key:',
      validate: (input) => {
        if (fs.existsSync(input)) {
          return true;
        }
        return 'The private key file does not exist. Please enter a valid path.';
      },
    },
    {
      type: 'input',
      name: 'userId',
      message: 'Enter the user ID:',
    },
    {
      type: 'input',
      name: 'expirationDate',
      message: `Enter the expiration date in Unix timestamp (default is 1 year from now: ${nextYearTimestamp})`,
      default: () => nextYearTimestamp,
    },
  ];

  let answers;
  try {
    answers = await inquirer.prompt(questions);
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      console.log('Aborted by user');
      process.exit(0);
    }
    console.error('Error generating JWT:', error.message);
    process.exit(1);
  }

  try {
    const privateKey = fs.readFileSync(answers.privateKeyPath, 'utf8');
    const payload = {
      sub: answers.userId,
      aud: 'account-d.docusign.com',
      iat: Math.floor(Date.now() / 1000),
      exp: parseInt(answers.expirationDate),
    };

    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    const dateUnix = Math.floor(Date.now() / 1000);
    const fileName = `./generated-jwt/${dateUnix}.jwt`;
    fs.writeFileSync(fileName, token);
    console.log(`JWT saved to ${fileName}`);
    console.log('Generated JWT:', token);
  } catch (error) {
    console.error('Error generating JWT:', error);
  }
}

generateWebToken();
