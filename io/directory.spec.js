const test = require('tape');

const directory = require('./directory');
const randomstring = require('randomstring');

const defaultDirectory = 'c:/temp';

const options = {
    length: 7,
    charset: 'alphabetic',
    capitalization: 'lowercase',
};

function defaultDirectoryExists(assert) {
    return directory.exists(defaultDirectory)
        .then((exists) => {
            if (!exists) {
                const error = `Test directory ${defaultDirectory} does not exist`;
                assert.fail(error);
                assert.end();
                return Promise.reject(error);
            }
        });
}

test('directory is created and deleted', (assert) => {
    defaultDirectoryExists(assert).then(() => {
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
