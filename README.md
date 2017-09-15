# port-kill

Kill process that uses selected TCP port. Cross platform.


## Install

### Global module

```
$ npm i -g port-kill
```

then use it from command line

```
pk
```

### Node module

This module comes in two parts: one for checking if port is being used, other to actually find PID
of process using port and killing it.

#### isPortTaken

```js

  /**
    * isPortTaken
    * @param {Number} port - number to check
    * @return {Promise} - Resolves to true if port is taken, otherwise false.
    *                     Rejects with Error if any occured
    */

  // Usage:
  import { isPortTaken } from 'port-kill';
  // or const { isPortTaken } = require('port-kill');

  async function checkPort(port: number) {

    let isTaken;
    try {
      isTaken = await isPortTaken(port);
    } catch(e) {
      throw new Error(e); // or handle it differently
    }

    return isTaken; // either true or false
  }

```

#### killProcess

```js

  /**
    * killProcess
    * @param {Number} port - number to check
    * @return {Promise} - Resolves to true if successfuly killed a process
    *                     Otherwise, rejects with error
    */

  // Usage:
  import { killProcess } from 'port-kill';
  // or const {killProcess} = require('port-kill');

  async function killProcessAtPort(port: number) {
    try {
      killProcess(port);
    } catch(e) {
      throw new Error(e); // or handle it differently
    }

    return 'Success!';
  }

```
  


## License

[MIT](./LICENSE)
