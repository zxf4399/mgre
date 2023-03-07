# mgre

## Manage Git repository easily

<a href="https://npmjs.com/package/mgre"><img src="https://img.shields.io/npm/v/mgre.svg" alt="npm package"></a>
<a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/mgre.svg" alt="node compatibility"></a>

## Why mgre?

When you use git to clone a repository, the repository will be cloned to the current directory if you don't specify a directory. This means that you may need to determine the appropriate directory in which to clone the repository and set up the repository correct username and email to commit. While this may be easy to do once, git clone is often used, and the process can become time-consuming.

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
# support clone pattern like git clone
mgre clone https://github.com/zxf4399/mgre.git
# or
mgre clone git@github.com:zxf4399/mgre.git
```

After cloning, the repository will be moved to the base directory

```bash
base
├── config.json
├── github.com
│   └── zxf4399
│       └── mgre
└── mgre.db
```

### Find a repository

```bash
# find support fuzzy search
mgre find zxf4399/mgre
```

If the repository is located, its path will be displayed; otherwise, no output will be generated.

### Import existing repositories

If you have an existing repository that you want to import into mgre, you can use the import command.

```bash
# For example, if the repository's local path is ~/code/mgre
mgre import ~/code/mgre
```

After importing, the repository will be moved to the base directory

```bash
base
├── config.json
├── github.com
│   └── zxf4399
│       └── mgre
└── mgre.db
```

If you want to import multiple repositories, you can import them parent directory.

```bash
# For example, if the repository A's local path is ~/code/mgre
# and the repository B's local path is ~/code/zxf4399.github.io

mgre import ~/code
```

After importing, the repositories will be moved to the base directory

```bash
base
├── config.json
├── github.com
│   └── zxf4399
│       ├── mgre
│       └── zxf4399.github.io
└── mgre.db

```

## Inspiration

-   [projj](https://github.com/popomore/projj)
-   [tanyao](https://github.com/xn-sakina/tanyao)

## License

[MIT](LICENSE)
