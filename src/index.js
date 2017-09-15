/**
 * @flow
 */

const net = require('net');

const exec = require('child_process').exec;

/*
 * Checks if the port is already in use
 * 
 * Resolves with true if port taken, false otherwise
 * Rejects with error if other than 'Port in use' type
 */
function isPortTaken(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const portTester = net
      .createServer()
      .once('error', (e: Error) => {
        if (e.toString().includes('EADDRINUSE')) {
          resolve(true);
        } else {
          reject(e.toString());
        }
      })
      .once('listening', () => {
        portTester.close();
        resolve(false);
      })
      .listen(port);
  });
}

/*
 * Kills process 
 */
function killProcess(port: number): Promise<boolean | string> {
  /*
   * Based on platform, decide what service
   * should be used to find process PID
   */
  const serviceToUse =
    process.platform === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -n -i:${port} | grep LISTEN`;

  return new Promise((resolve, reject) => {
    /*
     * Find PID that is listening at given port
     */
    exec(serviceToUse, (error: Error, stdout: string) => {
      if (error) {
        /* 
         * Error happens if no process found at given port
         */
        reject(error.toString());
        return;
      }
      /* 
       * If no error, that means port is in use 
       * And this port is used only by one process
       */
      const PIDInfo = stdout
        .trim()
        .split('\n')[0]
        .split(' ')
        .filter(entry => entry);

      /* macOSX/Linux: PID is placed at index 1 
       * Windows: PID is placed at last index
       */
      const index = process.platform === 'win32' ? PIDInfo.length - 1 : 1;
      let PID = -1;
      try {
        PID = parseInt(PIDInfo[index], 10);
      } catch (e) {
        reject(e.toString());
      }

      /*
       * Kill process
       */
      try {
        process.kill(PID);
      } catch (e) {
        reject(e.toString());
      }
      resolve(true);
    });
  });
}

module.exports = {
  isPortTaken,
  killProcess,
};
