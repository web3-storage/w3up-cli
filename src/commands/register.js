import ora from 'ora'
import Inquirer from 'inquirer'
import client from '../client.js'
import { isEmail } from '../validation.js'

const exe = async (argv) => {
  const { email } = argv
  // TODO: https://github.com/nftstorage/w3up-cli/issues/15
  // this can hang if there's network disconnectivity.
  const view = ora({ text: `Registering ${email}`, spinner: 'line' }).start()

  try {
    let result = await client.register(email)

    if (!result?.error) {
      view.stopAndPersist({
        text: `${
          result + '.' || ''
        } Check inbox & paste registration token below\n`,
      })
      const { token } = await Inquirer.prompt({
        name: 'token',
        validate: (answer) => {
          if (answer.split('.').length >= 3) {
            return true
          } else {
            throw new Error(`Not a valid JWT token`)
          }
        },
      })

      if (token) {
        result = await client.validate(token)
      }
      view.succeed(result)
    }
  } catch (err) {
    view.fail(err.toString())
  }
}

const register = {
  cmd: 'register <email>',
  description: 'Register your UCAN Identity with w3up',
  build: (yargs) => {
    yargs.check((argv) => {
      const { email } = argv
      //pretty loose, really just checking typos.
      if (isEmail(email)) {
        return true
      }
      throw new Error(`Error: ${email} is probably not a valid email.`)
    })
    return yargs
  },
  exe,
}

export default register
