const test = require('tape');
const file = require('./file');
const directory = require('./directory');
const randomstring = require('randomstring');

const defaultDirectory = './temp';

const options = {
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
        const testFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;
        file.create(testFile)
            .then(() => file.path(testFile)
                .then((path) => {
                    assert.equal(path.substring(1, 2), ':', 'correct fullpath');
                    assert.end();
                })
            ).then(() => file.remove(testFile));
    });
});

test('file is created and deleted', (assert) => {
    ensureDirectory(assert).then(() => {
        const testFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;
        file.create(testFile)
            .then(() => file.exists(testFile).then((exists) => {
                assert.true(exists, 'file exists');
            }))
            .then(() => file.remove(testFile))
            .then(() => file.exists(testFile).then((exists) => {
                assert.false(exists, 'file removed');
                assert.end();
            }));
    });
});

test('file is created and deleted with relative path', (assert) => {
    const testFile = `${randomstring.generate(options)}.txt`;
    file.create(testFile)
        .then(() => file.exists(testFile).then((exists) => {
            assert.true(exists, 'file exists');
        }))
        .then(() => file.remove(testFile))
        .then(() => file.exists(testFile).then((exists) => {
            assert.false(exists, 'file removed');
            assert.end();
        }));
});

test('file is created and returned', (assert) => {
    ensureDirectory(assert).then(() => {
        const testFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;
        file.create(testFile)
            .then(f => file.exists(f).then((exists) => {
                assert.true(exists, 'file exists');
                assert.end();
            }))
            .then(() => file.remove(testFile));
    });
});

test('file is written and read', (assert) => {
    ensureDirectory(assert).then(() => {
        const testFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;
        file.write(testFile, 'io-extra is easy!')
            .then(() => file.read(testFile))
            .then((text) => {
                assert.equal(text, 'io-extra is easy!', 'correct text');
                assert.end();
                return Promise.resolve();
            })
            .then(() => file.remove(testFile));
    });
});

test('file is copied and replaced', (assert) => {
    ensureDirectory(assert).then(() => {
        const sourceFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;
        const destinationFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;

        file.write(sourceFile, '1')
            .then(() => file.create(destinationFile))
            .then(() => file.copy(sourceFile, destinationFile))
            .then(() => file.read(destinationFile))
            .then((text) => {
                assert.equal(text, '1', 'same text');
                assert.end();
            })
            .then(() => file.remove(sourceFile))
            .then(() => file.remove(destinationFile));
    });
});

test('file is not copied when overwriting is disabled', (assert) => {
    ensureDirectory(assert).then(() => {
        const sourceFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;
        const destinationFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;

        file.write(sourceFile, '1')
            .then(() => file.write(destinationFile, '2'))
            .then(() => file.copy(sourceFile, destinationFile, false))
            .then(() => file.read(destinationFile))
            .then((text) => {
                assert.equal(text, '2', 'same text');
                assert.end();
            })
            .then(() => file.remove(sourceFile))
            .then(() => file.remove(destinationFile));
    });
});

test('file is copied with destination tree structure created', (assert) => {
    ensureDirectory(assert).then(() => {
        const sourceFile = `${defaultDirectory}/${randomstring.generate(options)}.txt`;

        const destinationDir = `${defaultDirectory}/${randomstring.generate(options)}`;
        const destinationFile = `${destinationDir}/${randomstring.generate(options)}.txt`;

        file.write(sourceFile, '1')
            .then(() => file.copy(sourceFile, destinationFile))
            .then(() => file.exists(destinationFile))
            .then((exists) => {
                assert.ok(exists, 'file copied');
                assert.end();
            })
            .then(() => file.remove(sourceFile))
            .then(() => directory.remove(destinationDir));
    });
});
