const test = require('tape');

const file = require('./file');
const directory = require('./directory');
const randomstring = require('randomstring');

const defaultDirectory = './temp';

const shortname = {
    length: 7,
    charset: 'alphabetic',
    capitalization: 'lowercase',
};

function ensureDirectory(assert) {
    let path;
    return directory.create(defaultDirectory)
        .then((dir) => {
            path = dir;
            return directory.exists(dir);
        })
        .then((exists) => {
            if (!exists) {
                const error = `Test directory ${path} does not exist`;
                assert.fail(error);
                assert.end();
                return Promise.reject(error);
            }
            return Promise.resolve(path);
        });
}

test.skip('returns fullpath', (assert) => {
    ensureDirectory(assert).then(() => {
        const testDirectory = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        directory.create(testDirectory)
            .then(() => directory.path(testDirectory)
                .then((path) => {
                    assert.equal(path.substring(1, 2), ':', 'correct fullpath');
                    assert.end();
                })
            ).then(() => directory.remove(testDirectory));
    });
});

test('directory is created and deleted', (assert) => {
    ensureDirectory(assert).then(() => {
        const testDirectory = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        directory.create(testDirectory)
            .then(() => directory.exists(testDirectory).then((exists) => {
                assert.true(exists, 'directory exists');
            }))
            .then(() => directory.remove(testDirectory))
            .then(() => directory.exists(testDirectory).then((exists) => {
                assert.false(exists, 'directory removed');
                assert.end();
            }));
    });
});

test('returns no error when nonexisting directory cant be deleted', (assert) => {
    ensureDirectory(assert).then(() => {
        const testDirectory = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        directory.remove(testDirectory)
            .then(() => {
                assert.pass('no error');
                assert.end();
            });
    });
});

test('copies directory with files', (assert) => {
    ensureDirectory(assert).then(() => {
        const source = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        const destination = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        const filename = `${randomstring.generate(shortname)}.txt`;
        const sourceFile = `${source}/${filename}`;
        const destinationFile = `${destination}/${filename}`;

        const options = { overwrite: true };

        file.create(sourceFile)
            .then(() => directory.copy(source, destination, options))
            .then(() => file.exists(destinationFile))
            .then((exists) => {
                assert.ok(exists, 'file exists');
                assert.end();
            })
            .then(() => directory.remove(destination))
            .then(() => directory.remove(source));
    });
});

test('renames directory with files', (assert) => {
    ensureDirectory(assert).then(() => {
        const source = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        const destination = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        const filename = `${randomstring.generate(shortname)}.txt`;
        const sourceFile = `${source}/${filename}`;
        const destinationFile = `${destination}/${filename}`;

        file.create(sourceFile)
            .then(() => directory.rename(source, destination))
            .then(() => file.exists(destinationFile))
            .then((exists) => {
                assert.ok(exists, 'file exists');
            })
            .then(() => file.exists(source))
            .then((exists) => {
                assert.notOk(exists, 'source renamed');
                assert.end();
            })
            .then(() => directory.remove(destination))
            .then(() => directory.remove(source));
    });
});

test('cleans directory', (assert) => {
    ensureDirectory(assert).then(() => {
        const source = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        const filename = `${randomstring.generate(shortname)}.txt`;
        const sourceFile = `${source}/${filename}`;

        file.create(sourceFile)
            .then(() => directory.clean(source))
            .then(() => file.exists(sourceFile))
            .then((exists) => {
                assert.notOk(exists, 'file does not exist');
                assert.end();
            })
            .then(() => directory.remove(source));
    });
});

test('moves directory and overwrite', (assert) => {
    ensureDirectory(assert).then(() => {
        const source = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        const filename = `${randomstring.generate(shortname)}.txt`;
        const filename2 = `${randomstring.generate(shortname)}.txt`;
        const sourceFile = `${source}/${filename}`;
        const sourceFile2 = `${source}/${filename2}`;
        const destination = `${defaultDirectory}/${randomstring.generate(shortname)}`;
        const destinationFile = `${destination}/${filename}`;
        const destinationFile2 = `${destination}/${filename2}`;

        directory.create(destination)
            .then(() => file.create(sourceFile))
            .then(() => file.create(sourceFile2))
            .then(() => directory.move(source, destination))
            .then(() => directory.exists(source))
            .then((exists) => {
                assert.notOk(exists, 'source moved');
            })
            .then(() => file.exists(destinationFile))
            .then((exists) => {
                assert.ok(exists, 'file exists');
            })
            .then(() => file.exists(destinationFile2))
            .then((exists) => {
                assert.ok(exists, 'file exists');
                assert.end();
            })
            .then(() => directory.remove(destination));
    });
});
