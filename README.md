# io-extra

Library to simplify file system access with promises in Node.js (Node version > 4.3.2)

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

File Methods
-------
- [exists](#file-exists)
- [create](#create-file)
- [remove](#remove-file)

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

Creates a file if it doesn't already exists.
Promise returns the full path of the created file.

Example:

```js
const io = require('io-extra');

io.file.exists('/tmp/myfile').then((file) => console.log('file ' + file + ' created.'));
```

### remove file

**remove(file)**

Removes a file if it exists.
Empty promise is returned.

Example:

```js
const io = require('io-extra');

io.file.remove('/tmp/myfile').then(() => console.log('file removed.'));
```
