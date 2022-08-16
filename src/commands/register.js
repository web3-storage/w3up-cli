import ora from 'ora'
import Inquirer from 'inquirer'

export async function register(uploader, value) {
  const view = ora('register')
  try {
    let result = await uploader.register(value)

    if (result) {
      view.stopAndPersist({
        text: `${result}, check inbox & paste registration token below\n`,
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
        result = await uploader.validate(token)
      }
      view.succeed(result)
    }
  } catch (err) {
    view.fail(err)
  }
}
