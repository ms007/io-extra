const test = require('tape');
const file = require('./file');
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

test('file is created and deleted', (assert) => {
    defaultDirectoryExists(assert).then(() => {
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
