const quickstart = `
Quickstart:
1. Generate Your identity
\t - w3up id \t\t\t Create an id
\t - w3up register <email> \t Register
2. Upload to W3 Up
\t - w3up upload <filename> \t Upload a file
3. Verify
\t - w3up list \t\t\t View your upload
`

export default function printQuickstart() {
  console.log(quickstart)
}
