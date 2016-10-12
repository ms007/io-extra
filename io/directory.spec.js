const test = require('tape');

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

test('returns fullpath', (assert) => {
    ensureDirectory(assert).then(() => {
        const testDirectory = `${defaultDirectory}/${randomstring.generate(options)}`;
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
        const testDirectory = `${defaultDirectory}/${randomstring.generate(options)}`;
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
        const testDirectory = `${defaultDirectory}/${randomstring.generate(options)}`;
        directory.remove(testDirectory)
            .then(() => {
                assert.pass('no error');
                assert.end();
            });
    });
});
