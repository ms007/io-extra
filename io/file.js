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

function rename(src, dest, overwrite = true) {
    const func = () => fs.rename(src, dest).then(() => path(dest));

    if (overwrite) {
        return func();
    }

    return exists(dest).then((alreadyExists) => {
        if (alreadyExists) {
            return path(dest);
        }

        return func();
    });
}

function move(src, dest, overwrite = true) {
    const options = {
        clobber: overwrite,
    };

    return fs.move(src, dest, options).then(() => path(dest));
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
    rename,
    move,
    copy,
    read,
    write,
};
