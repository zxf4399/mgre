# mgre

## Manage Git repository easily

[![NPM version][npm-image]][npm-url]

[npm-url]: https://npmjs.org/package/projj

## Why mgre?

When you use git clone to clone a repository, the repository will be cloned to the current directory if you don't specify a directory. This means that you may need to determine the appropriate directory in which to clone the repository and set up the repository correct username and email to commit. While this may be easy to do once, git clone is often used, and the process can become time-consuming.

To resolve this problem, you can use mgre. With mgre, your directory structure will automatically be organized as follows:

```bash
.
├── github.com
│   └── zxf4399
│       └── mgre
└── gitlab.com
    └── zxf4399
        └── mgre
```

> **Node.js Compatibility Note:**
> mgre requires [Node.js](https://nodejs.org/) v16+ or higher. Please upgrade your Node.js version if you are using an older version.

## Install

```bash
# With pnpm
$ pnpm install -g mgre
# With yarn
$ yarn global add mgre
# With npm
$ npm install -g mgre
```

## Config

mgre need a configuration file named `config.json` to work properly.

mgre will automatically create it in your home directory. For example, on MacOS the path is `~/.mgre/config.json`.

### Set up codebases

> **Note:**
> name and email are optional.

```json
{
    "codebases": [
        {
            "email": "zxf4399@gmail.com",
            "name": "zxf4399",
            "url": "github.com"
        }
    ]
}
```

## Usage

### Clone a repository

```bash
mgre clone https://github.com/zxf4399/mgre.git
# or
mgre clone git@github.com:zxf4399/mgre.git
# or gitlab repository
```

If the cloning is successful:

-   mgre will copy `cd <path>` to your clipboard, allowing you to quickly navigate to the repository.
-   the repository will be configured with the correct username and email if `config.json` contain name and email fields for configuring codebases.
