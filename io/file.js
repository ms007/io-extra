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

module.exports = {
    path,
    exists,
    create,
    remove,
};
