export const printHelp = (cli) => {
  const commands = Object.keys(cli.commands).join('\n')
  console.log(`You can run one of the following commands:\n${commands}`)
}
