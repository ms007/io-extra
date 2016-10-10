const fs = require('fs-promise');

function exists(file) {
    return fs.exists(file);
}

function create(file) {
    return fs.ensureFile(file).then(() => Promise.resolve(file));
}

function remove(file) {
    return fs.remove(file);
}

module.exports = {
    exists,
    create,
    remove,
};
