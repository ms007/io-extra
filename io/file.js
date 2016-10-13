const fs = require('fs-promise');

function path(file) {
    return fs.realpath(file);
}

function exists(file) {
    return fs.exists(file);
}

function create(file) {
    return fs.ensureFile(file).then(() => path(file));
}

function remove(file) {
    return fs.remove(file);
}

function copy(src, dest, overwrite = true, preserveTimestamps = false) {
    const options = {
        clobber: overwrite,
        preserveTimestamps,
    };
    return fs.copy(src, dest, options).then(() => path(dest));
}

function read(file, options = {}) {
    const opts = Object.assign({}, options);
    if (!opts.encoding) {
        opts.encoding = 'utf8';
    }
    return fs.readFile(file, opts);
}

function write(file, data, options) {
    return fs.outputFile(file, data, options);
}

module.exports = {
    path,
    exists,
    create,
    remove,
    delete: remove,
    copy,
    read,
    write,
};
