[![Build Status](https://travis-ci.org/CVBDL/EagleEye-Platform.svg?branch=master)](https://travis-ci.org/CVBDL/EagleEye-Platform) [![Coverage Status](https://coveralls.io/repos/github/CVBDL/EagleEye-Platform/badge.svg)](https://coveralls.io/github/CVBDL/EagleEye-Platform)

# EagleEye Platform

[![Join the chat at https://gitter.im/CVBDL](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/CVBDL)


## Install required softwares


### Windows

* Install Git (https://git-scm.com/download/win)
* Install Node.js (https://nodejs.org/dist/v4.4.5/node-v4.4.5-x64.msi)
* Install MongoDB (https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-3.2.7-signed.msi)

Create a new folder in `C:\`:

```text
C:\data\db\
```

> Note: You may need to add MongoDB path to system environment variables: `C:\Program Files\MongoDB\Server\3.2\bin`


### MacOS

* Install Homebrew (http://brew.sh)

```sh
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

* Update Homebrew's package database.

```sh
brew update
```

* Install Node.js v4.4.5 LTS

```sh
brew install homebrew/versions/node4-lts
```

* Install MongoDB with TLS/SSL support

```sh
brew install mongodb --with-openssl
```


## Install application Node.js packages

```sh
npm install
npm install gulp-cli -g
```


## Running the application

```sh
npm run start-mongodb
npm start
```


## Testing

Run once:

```sh
npm test
```

CI mode:

```sh
gulp watch
```
