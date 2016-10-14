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

function copy(src, dest, options = {}) {
    const opts = Object.keys(options)
        .reduce((previous, current) => {
            const items = Object.assign({}, previous);
            if (current === 'overwrite') {
                items.clobber = options[current];
            } else {
                items[current] = options[current];
            }

            return items;
        }, {});

    return fs.copy(src, dest, opts).then(() => path(dest));
}

module.exports = {
    path,
    exists,
    create,
    remove,
    delete: remove,
    copy,
};
