# EagleEye Platform


## Install required softwares


### Windows

* Install Git (https://git-scm.com/download/win)
* Install Node.js (https://nodejs.org/dist/v4.4.5/node-v4.4.5-x64.msi)
* Install MongoDB (https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-3.2.7-signed.msi)


## MacOS

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
```


## Running the application

```sh
start_mongo.bat
start_server.bat
```


## Testing

```sh
unitTest.bat
```
