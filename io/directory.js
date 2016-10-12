const fs = require('fs-promise');

function path(directory) {
    return fs.realpath(directory);
}

function exists(directory) {
    return fs.exists(directory);
}

function create(directory) {
    return fs.ensureDir(directory).then(() => path(directory));
}

function remove(directory) {
    return fs.remove(directory);
}

module.exports = {
    path,
    exists,
    create,
    remove,
};
