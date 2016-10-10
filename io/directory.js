const fs = require('fs-promise');

function exists(directory) {
    return fs.exists(directory);
}

function create(directory) {
    return fs.ensureDir(directory);
}

function remove(directory) {
    return fs.remove(directory);
}

module.exports = {
    exists,
    create,
    remove,
};
