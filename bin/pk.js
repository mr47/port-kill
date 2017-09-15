#!/usr/bin/env node
/*
 * port-kill 
 * Kill process that uses given TCP port.
 * 
 */

/* eslint no-console: 0 */
const { isPortTaken, killProcess } = require('../lib');
const fs = require('fs');
const path = require('path');

const pkVersion = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
).version;

function printHelp() {
  const help = `
    port-kill

    Available commands:

      -v, --version   Display version
      -h, --help      Display this help

      pk xxxx         Kill process that uses xxxx TCP port
  `;
  console.log(help);
}

function printVersion() {
  const version = `
  port-kill

  Current version: ${pkVersion}
  `;
  console.log(version);
}

function printUnknownCommand() {
  const unknown = `
  port-kill

  Argument is not valid. Try -h for help.
  `;
  console.log(unknown);
}

function handlePortKill(arg) {
  const port = parseInt(arg, 10);
  if (typeof port !== 'number' || isNaN(port)) {
    return printUnknownCommand();
  }

  if (port <= 1024) {
    console.log(`
    port-kill

    Ports under 1024 cannot be closed. Try different port!
    `);
    process.exit();
  }

  return isPortTaken(port)
    .then(isTaken => {
      if (!isTaken) {
        console.log(`TCP port ${port} is not taken by any process. Aborting.`);
      } else {
        killProcess(port).then(() => {
          console.log(
            `Successfully killed process. TCP ${port} is free to use.`
          );
          process.exit();
        });
      }
    })
    .catch(e => {
      console.log(`Something went wrong:
${e}`);
    });
}

function pk() {
  const [argument] = process.argv.splice(2);

  if (!argument) {
    return printHelp();
  }

  switch (argument) {
    case '-h':
    case 'h':
    case 'help':
    case '--help':
      printHelp();
      break;
    case '-v':
    case 'v':
    case 'version':
    case '--version':
      printVersion();
      break;
    default:
      handlePortKill(argument);
  }

  return true;
}

pk();
