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
- [read](#read-file)
- [write](#write-file)

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

### read file

**read(file, [encoding])**

Reads the entire contents of a file.
Promise contains the text of the file.

encoding = (optional string) specifies the type of encoding to read the file. Possible encodings are 'ascii', 'utf8', and 'base64'. If no encoding is provided, the default is utf8.

Example:

```js
const io = require('io-extra');

io.file.read('/tmp/myfile').then((text) => console.log(text));
```

### write file

**write(file, data, [encoding])**

Writes data to a file, replacing the file if it already exists.
If the parent directory does not exist, it's created.
Empty promise is returned.

file = (string) filepath of the file to write to.

data = (string or buffer) the data you want to write to the file.

encoding = (optional string) the encoding of the data. Possible encodings are 'ascii', 'utf8', and 'base64'. If no encoding provided, then 'utf8' is assumed.

Example:

```js
const io = require('io-extra');

io.file.write('/tmp/myfile', 'io-extra is easy!').then(() => console.log('file written.'));
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
