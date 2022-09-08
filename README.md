<h1 align="center">w3up-cli 🆙</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/web3-storage/w3up-cli/blob/main/LICENSE.md" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/badge/License-Apache--2.0-yellow.svg" />
  </a>
</p>

> w3up-cli is a command-line interface for the W3up platform by Dag.House. You can use the cli to do things like generate an identity, register, upload assets, list your uploads and more!

### 🏠 [Homepage](https://github.com/web3-storage/w3up-cli)

## Installation

Install from github:

```sh
npm install -g git@github.com:web3-storage/w3up-cli.git
```

Install from Npm

```sh
npm install -g w3up
```

## Usage

Running the `w3up` command with no arguments will show an overview of the [Quickstart](#quickstart) flow, which you'll want to follow when you're first getting set up.

### Quickstart

The "Quickstart" flow is outlined when you run `w3up` without giving it a command:

```sh
w3up
```

You should see something like the following:

```
Quickstart:
1. Generate Your identity
	- w3up id 			Create an id
	- w3up register <email> 	Register
2. Upload to W3 Up
	- w3up upload <filename> 	Upload a file or directory
3. Verify
	- w3up list 			View your upload

w3up

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]export-settings
```

To complete the quickstart flow, you'll need to use a few commands:

1. [`w3up id`](#id) generates a new identity keypair.
1. [`w3up register`](#register) associates your email address with your new identity key and grants access to the service.
1. [`w3up upload`](#upload) uploads files and directories.
1. [`w3up list`](#list) shows information about your uploads.

## Commands

This section covers the most important commands available in `w3up`. For a complete list, run `w3up --help`.

```sh
w3up --help
```

An example of the current output is shown below, but please note that we're rapidly improving `w3up`, and there may be some delay between changes in the code and updates to this README. If you notice that they have diverged before we do, please [open an issue][new-gh-issue] and let us know!

```
Usage:
  w3up <cmd> [options]

Commands:
  w3up id                                 Generate a UCAN Identity
  w3up register <email>                   Register your UCAN Identity with w3up
  w3up whoami                             Show your current UCAN Identity
  w3up list                               List your uploads
  w3up upload <path>                      Upload any file or directory to your a
                                          ccount               [aliases: import]
  w3up upload-cars <path>                 Walk a file directory, and upload any
                                          found cars to an account
  w3up remove <cid>                       Unlink a CID from your account.
                                                               [aliases: unlink]
  w3up import-settings <fileName>         Import a settings.json file
  w3up export-settings [filename]         Export a settings json file
  w3up reset-settings                     Delete all local settings
  w3up insights <cid>                     Get insights for a CID
  w3up inspect-car <path>                 Generate an examination file from a <p
                                          ath> to a CAR
  w3up generate-car <filePath> [outPath]  From an input file, locally generate a
                                           CAR file.
  w3up info                               Print information about cli

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]

Examples:
  w3up id                                 ID loaded: did:key:z6MkiWm...
  w3up whoami                             DID:12345...
  w3up list                               bafy...
                                          bafy...
  w3up upload ../../duck.png              uploaded bafy...
  w3up upload-cars ducks/                 <show all cars uploaded>
  w3up remove bafy...                     unlinked bafy...
  w3up inspect-car ../duck.car --tree     roots
                                          └─┬ bafy...
                                            └── duck.png
  w3up generate-car ../duck.png duck.car  CAR created ../duck.png => duck.car
  w3up info

Docs:
  https://github.com/nftstorage/w3up-cli

```


### Registration

Most of the commands in `w3up` require a registered identity keypair.

Registration is a two-step process:

1. [`w3up id`](#id) generates a new identity keypair.
2. [`w3up register`](#register) associates the identity key with your email address.

Once registered, you can verify that your identity has been registered using [`w3up whoami`](#whoami), which displays the id for your w3up account.

#### `id`

> Displays your identity keypair, creating it if it does not yet exist.

```sh
w3up id
```

On first run, generates the public and private key pairs necessary to work with the underlying [UCAN ](https://ucan.xyz/) authorization system.

Running `w3up id` a second time will load your key from disk instead of generating a new one.

You can validate you are registered!

If you have generated the id properly, you'll see your `did:key` printed in the command line. It should look like `did:bafy....`.

#### `register`

> Registers your identity with the w3up service.

```sh
w3up register you@example.com
```

After you've generated an identity, you need to register it with the w3up service. The `w3up register` command will display a message asking you to check your email. Once you click the activation link in the email, the `w3up register` command will complete the registration process and show a success message. 

_Note: Remember to check your spam folder if you suspect you never got the email_

#### `whoami`

> Displays the identifier for your w3up account.

```sh
w3up whoami
```

The `whoami` command displays an identifier for your w3up account. Note that this may differ from your identity key in cases where you have registered multiple identities to the same account.

### General Usage

After creating your identity and registering with w3up, you should be able to start using the service. The main commands you'll use are:

1. [`w3up upload`](#upload)
2. [`w3up list`](#list)
3. [`w3up remove`](#remove)

#### `upload`

> Uploads a file or directory and links it to your account.

```sh
w3up upload <filename>
```

**Important:** All data uploaded using `w3up` is made available to anyone who requests it using the correct [CID][concepts-cid]. Do not upload sensitive or private data in unencrypted form!

The example below uploads a file named `test.txt` containing the text `hello world`:

```sh
w3up upload test.txt
```

You should see something like this:

```
✔ Succeeded uploading bagbaieraq7mqnbxwetsl53fs776rcink4ar6ow5u5imrb3di6klochw2fdfq with 200: OK
roots:
 bafybeig3v73gypy3wshzjdq6aopisk66hjdwdma4cg6q7eojiuhivorkyi
```

Notice that there are two [CIDs][concepts-cid] printed in the output. The first CID identifies the [Content Archive (CAR)](#about-content-archives-cars) that `w3up` generates when preparing your files for upload. 

A CAR is a collection of content-addressed data "blocks", with one or more "root blocks" that contain data and/or links to other blocks. In the output above, there's a single root block with the CID `bafybeig3v73gypy3wshzjdq6aopisk66hjdwdma4cg6q7eojiuhivorkyi`. This root CID is what you want to use when retrieving data from IPFS. For example, to fetch the file from the HTTP gateway at `w3s.link`, you would use the URL https://w3s.link/ipfs/bafybeig3v73gypy3wshzjdq6aopisk66hjdwdma4cg6q7eojiuhivorkyi


> 📝 If you are uploading thousands of small files, it's faster to put them together into a directory and upload that, than to invoke this CLI with thousands of individual files.

#### `upload-cars`

> Bulk upload a collection of  CAR files (content archives) containing IPLD data.

The [`upload`](#upload) command described above accepts regular files and directories and packs them into a [Content Archive (CAR)](#about-content-archives-cars) before uploading to the web3.storage platform. If you already have your data in CAR format, of if you'd rather do the CAR conversion yourself, you can use the `upload-cars` command.

```sh
w3up upload-cars <path>
```

The `path` argument must point to a directory containing one or more CAR files. If there are nested directories, each will be recursively walked and all discovered CAR files will be uploaded.


#### `list`

> Prints a list of [CIDs][concepts-cid] for all files uploaded thus far.

```sh
w3up list
```

You should see something similar to this:

```
✔ Listing Uploads...
✔ CIDs:
bagbaieraq7mqnbxwetsl53fs776rcink4ar6ow5u5imrb3di6klochw2fdfq
```

Note that `list` currently shows the CID of the [Content Archive (CAR)](#about-content-archives-cars) that was uploaded and does not yet include the root CID of the content graph within the CAR.

#### `remove`

> Unlinks an uploaded CID, disassociating it from your account.

```sh
w3up remove <cid>
```

This will dis-associate an uploaded asset from your account. If you run `w3up list` after unlinking a file, you should not see it in the list. If you want to re-associate the file with your account, use `w3up upload` and re-upload the file. In situations when a file has been previously uploaded, the upload command will not need to actually upload the file, it will just relink it.

**Important:** `w3up remove` does not delete your data from the public IPFS network, Filecoin, or other decentralized storage systems used by w3up. Data that has been `remove`d and is not linked to any other accounts _may_ eventually be deleted from the internal storage systems used by the w3up service, but there are no guarantees about when (or whether) that will occur, and you should not depend on data being permanently deleted.

### CAR file commands

When using [`w3up upload`](#upload), your files are packed into a [Content Archive (CAR)](#about-content-archives-cars), which efficiently stores content-addressed blocks of data. In some cases, you may want to [upload CARs directly](#upload-cars), skipping the automatic conversion. For example, you may want to bulk-convert a large dataset into CAR format before upload to preserve a local backup of your data in CAR format.

`w3up` provides some commands for creating and working with CAR files. For more, see the [guide to working with Content Archives](https://web3.storage/docs/how-tos/work-with-car-files/) in the [Web3.Storage docs](https://web3.storage/docs).

#### `generate-car`

> Encodes a file or directory to CAR format.

The `generate-car` command accepts a path to a file or directory and creates a CAR file that can be uploaded with [`upload-cars`](#upload-cars).

```sh
w3up generate-car test.txt
```

```
✔ CAR created test.txt => bagbaieraq7mqnbxwetsl53fs776rcink4ar6ow5u5imrb3di6klochw2fdfq.car
roots:
 bafybeig3v73gypy3wshzjdq6aopisk66hjdwdma4cg6q7eojiuhivorkyi
```

As with the [`upload` command](#upload), two CIDs are printed in the `generate-car` output. The first CID is for the CAR file itself, while the root CID identifies the content within the CAR. Use the root CID when requesting content from IPFS, e.g. with `ipfs get` or from an HTTP gateway.

#### `inspect-car`

> Print the CID of all blocks in a CAR file.

The `inspect-car` command takes the path to a CAR file and prints the CID of each block contained in the CAR.

```sh
w3up inspect-car test.car
```

```
CIDv1								                                        CIDv0
bafybeicg2rebjoofv4kbyovkw7af3rpiitvnl6i7ckcywaq6xjcxnc2mby	zQmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o
bafybeig3v73gypy3wshzjdq6aopisk66hjdwdma4cg6q7eojiuhivorkyi	zQmd8DcmhjnfSBMLM7f9q3puvFuUgBjHiXeVZNHWh5ZWwjX
```

Note that each CID is printed twice, once in the current CID version 1 format, and once in the deprecated "v0" format. We strongly recommend using CIDv1 wherever possible, but the v0 CID may be useful for integration with existing systems.

You can also see the tree structure of the CAR file by passing in the `--tree` flag to `inspect-car`:

```sh
w3up inspect-car --tree test.car
```

```
roots
└─┬ bafybeig3v73gypy3wshzjdq6aopisk66hjdwdma4cg6q7eojiuhivorkyi
  └── test.txt
```

Finally, passing the `--dot` flag will output a description of the graph structure using the [DOT](https://graphviz.org/doc/info/lang.html) language defined by the [Graphviz](https://graphviz.org/) project, to allow visually inspecting the CAR structure.

### Settings management

There are a few commands for working with your settings.

Settings are stored in a binary configuration file in a `w3up-cli-nodejs` folder inside the [default configuration location for your platform](https://github.com/sindresorhus/env-paths#pathsconfig).

Rather than work with the binary settings file directly, it's convenient to use the [`import-settings`](#import-settings) and [`export-settings`](#export-settings) commands, which convert the binary format to JSON.

#### `export-settings`

> Exports your account settings to a file named `settings.json` in the current directory.

**Important**: this file contains your private identity key and must be kept in a secure location!

#### `import-settings`

> Loads account settings from a `settings.json` file in the current directory.

#### `reset-settings`

> Deletes your account settings.

**Important:** this command completely removes the binary configuration file containing your identity key from your local machine. If you have not exported your settings, you will lose access to the identity and will need to generate and register a new one.

### Other commands

#### `insights`

The w3up service offers "insights" about uploaded content that can be retreived using one of the following commands:

- `w3up insights`
- `w3up insights-ws`

```sh
w3up insights <cid>
```

`w3up insights <cid>` will hit the w3up service and retrieve all currently known insights for that CID. 

The `w3up insights-ws` is similar, but will set up a websockets-based watch and print any further insights as they are discovered.


## About Content Archives (CARs)

Under the hood, `w3up` always uploads data in the form of Content ARchives, or CARs. The [CAR format](https://ipld.io/specs/transport/car/) allows efficiently transmitting a collection of content-addressed blocks of data.

If you're using the [`upload` command](#upload), this should be relatively transparent, although you may notice that the command output shows the CID of the CAR as well as the CID of the content. If you're [uploading CARs directly](#upload-cars), you may also want to use the `w3up` commands for [working with CAR files](#car-file-commands).

You can find more information about working with CAR files in the [guide to working with CARs](https://web3.storage/docs/how-tos/work-with-car-files/) in the [Web3.Storage docs](https://web3.storage/docs).

## Run tests

```sh
yarn run test
```

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page][gh-issues].

## 📝 License

This project is [Apache--2.0][license] licensed.

---

[license]: https://github.com/nftstorage/w3up-cli/blob/main/LICENSE.md
[gh-issues]: https://github.com/nftstorage/w3up-cli/issues
[new-gh-issue]: https://github.com/nftstorage/w3up-cli/issues/new

[concepts-cid]: https://docs.ipfs.tech/concepts/content-addressing/#content-addressing-and-cids
