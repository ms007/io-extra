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
