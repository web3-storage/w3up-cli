<h1 align="center">w3up-cli 🆙</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/nftstorage/w3up-cli/blob/main/LICENSE.md" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/badge/License-Apache--2.0-yellow.svg" />
  </a>
</p>

> w3up-cli is a cli utility to allow for command line interaction with the W3up platform by Dag.House. You can use the cli to do things like generate an identity, register, upload assets, list your uploads and more!

### 🏠 [Homepage](https://github.com/nftstorage/w3up-cli)

## Installation

Install from github:

```sh
npm install -g git@github.com:nftstorage/w3up-cli.git
```

Install from Npm

```sh
npm install -g w3up
```

## Usage

You can view a list of all available commands with

```sh
w3up
```

You should see the following:

```
export-settings
id
import-settings
insights
insights-ws
list
register
reset-settings
unlink
upload
whoami
```

### Commands:

##### Registration

Before you can use most of the commands with the w3up-cli you need to generate an id and register that identity. This is handled in 2 steps:

1. `w3up id`
2. `w3up register`

```sh
w3up id
```

Generate your identity.
Generates the public and private key pairs necessary to work with the underlying [UCAN ](https://ucan.xyz/) system.

You can validate you are registered!

```sh
w3up whoami
```

If you have generated the id properly, you'll see your `did:key` printed in the command line. It should look like `did:bafy....`.

```sh
w3up register
```

Register your identity.
After you've generated an identity, you need to register it with the w3up service. You'll be sent an email with a code you paste into the command line when prompted. If the code matches what the service expects, you're fully registered and can use all the other commands.

_Note: Remember to check your spam folder if you suspect you never got the email_

##### General Usage

After creating your identity and registering with w3up, you should be able to start using the service. The main commands you'll use are

1. `upload`
2. `list`
3. `unlink`

```sh
w3up upload <filename>
```

Uploads a file or directory and link it to your account. The second argument is the path to that file or directory

```sh
w3up list
```

Print a list of [CIDs](https://docs.ipfs.tech/concepts/content-addressing/#content-addressing-and-cids) for all files uploaded thusfar.

```sh
w3up unlink <cid>
```

This will dis-associate an uploaded asset from your account. If you run `w3up list` after unlinking a file, you should not see it in the list. If you want to re-associate the file with your account, use `w3up upload` and re-upload the file. In situations when a file has been previously uploaded, the upload command will not need to actually upload the file, it will just relink it.

##### Other Commands

Working with your settings:

1. `import settings`
2. `export settings`

These commands will take your account settings and write them to a .json file in the directory you are in currently, or it will read a settings.json from a directory you're in an use those for the w3up settings.

## Run tests

```sh
yarn run test
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/nftstorage/w3up-cli/issues).

## 📝 License

This project is [Apache--2.0](https://github.com/nftstorage/w3up-cli/blob/main/LICENSE.md) licensed.

---
