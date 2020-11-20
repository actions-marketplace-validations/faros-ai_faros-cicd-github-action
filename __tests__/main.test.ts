import axios from 'axios';
import {Emit} from '../src/emit';
import {getEnvVar} from '../src/main';
import {mocked} from 'ts-jest/utils';
import * as process from 'process';
import * as core from '@actions/core';
import * as cp from 'child_process';
import * as path from 'path';

jest.mock('axios');
jest.mock('@actions/core');

const env = Object.assign({}, process.env);

describe('Emit to Faros action', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  // afterEach(() => {
  //   process.env = Object.assign({}, env);
  // });

  test('emits build info to faros', async () => {
    mocked(axios.request).mockResolvedValue({data: {revision: {uid: 1}}});
    const emit = new Emit('apiKey', 'server');
    await emit.build({
      uid: 'randomId',
      number: 100,
      sha: 'f4c36eb0687e45f22b1e8b3044bf0cae7b8349fe',
      org: 'faros-ai',
      repo: 'emitter',
      name: 'emit-action-flow',
      startedAt: BigInt(1594938057000),
      endedAt: BigInt(1594939057000),
      status: 'Failed'
    });
    expect(axios.request).toBeCalledTimes(1);
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'revision-id', 1);
  });

  test('emits deployment info to faros', async () => {
    mocked(axios.request).mockResolvedValue({data: {revision: {uid: 2}}});
    const emit = new Emit('apiKey', 'server');
    await emit.deployment({
      uid: 'deployment1',
      buildID: 'buildID1',
      appName: 'emitter',
      appPlatform: 'ECS',
      source: 'Spinnaker',
      startedAt: BigInt(1594938057000)
    });
    expect(axios.request).toBeCalledTimes(1);
    expect(core.setOutput).toHaveBeenNthCalledWith(1, 'revision-id', 2);
  });
  // For local testing only shows how the runner will run a javascript action. Update with correct values
  test.skip('test runs', () => {
    process.env['INPUT_APIKEY'] = 'apiKey';
    process.env['INPUT_STARTEDAT'] = '1594938057000';
    process.env['INPUT_ENDEDAT'] = '1605748281000';
    process.env['INPUT_MODEL'] = 'build';
    process.env['GITHUB_REPOSITORY'] = 'faros-ai/emit-cicd-info-to-faros';
    process.env['GITHUB_RUN_ID'] = '71882192';
    process.env['GITHUB_RUN_NUMBER'] = '10';
    process.env['GITHUB_WORKFLOW'] = 'CI/CD Pipeline';
    process.env['GITHUB_SHA'] = 'f4c36eb0687e45f22b1e8b3044bf0cae7b8349fe';
    process.env['JOB_STATUS'] = 'Success';
    const ip = path.join(__dirname, '..', 'lib', 'main.js');
    const options: cp.ExecSyncOptions = {
      env: process.env
    };
    console.log(cp.execSync(`node ${ip}`, options).toString());
  });
});
