# io-extra

Library to simplify file system access with promises in Node.js (Node version > 4.3.2)

[![npm Package](https://img.shields.io/npm/v/io-extra.svg?style=flat-square)](https://www.npmjs.org/package/io-extra)

**NOTE (2016-10-10):** Node v4.3.2 or newer is required (builtin promises).

Installation
------------

    npm install --save io-extra

Usage
-----

```js
const io = require('io-extra');

io.file.exists('/tmp/myfile').then((exists) => {
    if (exists) {
        console.log(`File exists`);
    }
}
```

[**File Methods**](#file)
[**Directory Methods**](#directory)


File
-------

- [path](#resolve-fullpath)
- [exists](#file-exists)
- [create](#create-file)
- [remove](#remove-file)

### resolve fullpath
**path(file)**

Returnes the resolved full path of a file.
The file must exist.

```js
const io = require('io-extra');

io.file.path('/tmp/myfile').then((file) => console.log('fullpath: ' + file));
// returns c:\tmp\myfile on Windows operating systems
```

### file exists

**exists(file)**

Check if a file exists.
Promise returns true or false whether the file exists or not.

Example:

```js
const io = require('io-extra');

io.file.exists('/tmp/myfile').then((exists) => console.log('file exists: ' + exists));
```

### create file

**create(file)**

Creates a file if it doesn't already exist.
If the file is in directories that do not exist, these directories are created.
Promise returns the full path of the created file.

Example:

```js
const io = require('io-extra');

io.file.create('/tmp/myfile').then((file) => console.log('file ' + file + ' created.'));
```

### remove file

**remove(file)**

Removes a file if it exists.
Empty promise is returned.

Alias: `delete()`

Example:

```js
const io = require('io-extra');

io.file.remove('/tmp/myfile').then(() => console.log('file removed.'));
```

Directory
-------

- [path](#resolve-directory-fullpath)
- [exists](#directory-exists)
- [create](#create-directory)
- [remove](#remove-directory)

### resolve directory fullpath
**path(directory)**

Returnes the resolved full path of a directory.
The directory must exist.

```js
const io = require('io-extra');

io.directory.path('/tmp').then((dir) => console.log('fullpath: ' + dir));
// returns c:\tmp on Windows operating systems
```

### directory exists

**exists(directory)**

Check if a directory exists.
Promise returns true or false whether the directory exists or not.

Example:

```js
const io = require('io-extra');

io.directory.exists('/tmp').then((exists) => console.log('directory exists: ' + exists));
```

### create directory

**create(directory)**

Creates a directory if it doesn't already exist.
If the parent directory does not exist, it is created.
Promise returns the full path of the created directory.

Example:

```js
const io = require('io-extra');

io.directory.create('/tmp').then((dir) => console.log('directory ' + dir + ' created.'));
```

### remove directory

**remove(directory)**

Removes a directory if it exists.
Empty promise is returned.

Alias: `delete()`

Example:

```js
const io = require('io-extra');

io.directory.remove('/tmp').then(() => console.log('directory removed.'));
```
