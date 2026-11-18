import { test } from '@oclif/test';
import axios from 'axios';
import { expect } from 'chai';

describe('Relative file path', () => {
  test
    .stdout()
    .command(['start', '--data', './test/data/envs/file.json'])
    .do(async () => {
      const result = await axios.get('http://localhost:3000/file');

      expect(result.data).to.contain('filecontent');
    })
    .do(async () => {
      // partially templated file path, helper in the middle of the file name
      const result1 = await axios.get('http://localhost:3000/testfile/1', {
        transformResponse: [(data) => data]
      });
      const result2 = await axios.get('http://localhost:3000/testfile/2', {
        transformResponse: [(data) => data]
      });

      expect(result1.data.trim()).to.equal('filecontent');
      expect(result2.data.trim()).to.equal('filecontent2');

      // templated file path escaping the environment directory
      const escapeResult = await axios.get(
        'http://localhost:3000/testfile/%2F..%2F..%2F..%2F..%2Fpackage',
        {
          transformResponse: [(data) => data]
        }
      );

      expect(escapeResult.data).to.contain(
        'Error while serving the content: Access to relative path outside of the environment base directory'
      );
      expect(escapeResult.data).to.not.contain('@mockoon/cli');
    })
    .finally(() => {
      process.emit('SIGINT');
    })
    .it(
      'should start mock on port 3000 and call GET /file and get the file with a relative path from the environment file',
      (context) => {
        expect(context.stdout).to.contain('Server started');
      }
    );
});
