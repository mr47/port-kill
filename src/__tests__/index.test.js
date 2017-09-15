/* eslint-env jest */

const net = require('net');
const portkillModule = require('../index');
const childProcess = require('child_process');

jest.mock('child_process');

const { killProcess, isPortTaken } = portkillModule;

const testServer = net.createServer();

const mockServer = {
  randomPort: () => Math.round(Math.random() * 5000) + 1024,
  start: port => {
    testServer.listen(port);
  },
  close: () => {
    testServer.close();
  },
};

describe('port checker', () => {
  it('should say port is taken', done => {
    const randomPort = mockServer.randomPort();

    mockServer.start(randomPort);
    isPortTaken(randomPort).then(answer => {
      expect(answer).toBeTruthy();
      mockServer.close();
      done();
    });
  });
  it('should say port is free', done => {
    const randomPort = mockServer.randomPort();

    isPortTaken(randomPort).then(isTaken => {
      expect(isTaken).toBeFalsy();
      done();
    });
  });
  it('should fail with wrong port given', done => {
    isPortTaken(80)
      .then(() => {})
      .catch(e => {
        expect(e).toBeTruthy();
        expect(e).toMatch('EACCES');
        done();
      });
  });
});

describe('process killer', () => {
  it('should fail on forbidden port', done => {
    childProcess.exec.mockImplementationOnce((cmd, cb) => {
      if (cmd.includes('100')) {
        cb(`Error: port forbidden`);
      }
    });
    killProcess(100).catch(e => {
      expect(e).toBeTruthy();
      expect(e).toMatch(`port forbidden`);
      done();
    });
  });
  it('fails when cannot kill port', done => {
    const port = 123;
    childProcess.exec.mockImplementationOnce((cmd, cb) => {
      if (cmd.includes(port.toString())) {
        cb(null, `PID: 666 `); /* mocking */
      }
    });

    killProcess(port).catch(e => {
      expect(e).toBeTruthy();
      expect(e).toMatch(/(ESRCH|Error)/);
      done();
    });
  });

  it('kills port with success', done => {
    const port = 8888;
    const pid = 6543;
    childProcess.exec.mockImplementationOnce((cmd, cb) => {
      if (cmd.includes(port.toString())) {
        cb(null, `PID: 6543`); /* mocking */
      }
    });
    process.kill = pidNumber => {
      if (pidNumber === pid) {
        return true;
      }
      throw Error('WRONG PID');
    };

    killProcess(port).then(result => {
      expect(result).toBeTruthy();
      expect(result).toBe(true);
      done();
    });
  });
});
