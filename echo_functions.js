"use strict";
const term = require( 'terminal-kit' ).terminal;
const LINES = {
  INSTRUCTIONS: [1,1],
  INPUT: [1,2],
  PLAYLIST: [3, 5],
  STATUS: [1, term.height]
}
const CONFIG = {
  ECHO_TIMEOUT: 1000
};
let TIMEOUT_TIMER = null;

const echo_input = ( ...text) => {
  return term.moveTo.eraseLine.magenta( LINES.INPUT[0], LINES.INPUT[1],  ...text );
}

const echo_input_success = ( ...text) => {
  clearTimeout(TIMEOUT_TIMER);
  term.moveTo.eraseLine.green( LINES.INPUT[0], LINES.INPUT[1],  ...text );
  TIMEOUT_TIMER = setTimeout(() => {
    term.moveTo.eraseLine( LINES.INPUT[0], LINES.INPUT[1]);
  }, CONFIG.ECHO_TIMEOUT)
}

const echo_instructions = ( ...text) => {
  return term.bold.moveTo.eraseLine.cyan( LINES.INSTRUCTIONS[0], LINES.INSTRUCTIONS[1],  ...text );
}

const echo_status = ( ...text) => {
  return term.bold.moveTo.eraseLine.white( LINES.STATUS[0], LINES.STATUS[1],  ...text );
}

const echo_clear_playlist = (playlist) => {
  let yPos = LINES.PLAYLIST[1];
  playlist.forEach((item, index) => {
    term.bold.moveTo.eraseLine( LINES.PLAYLIST[0], yPos);
    yPos += 1;
  })
}

const echo_playlist = (playlist, playingIndex) => {
  let yPos = LINES.PLAYLIST[1];
  playlist.forEach((item, index) => {
    let isPlaying = index === playingIndex ? '>>' : '  ';
    let color     = index === playingIndex ? 'green' : 'white';
    term.bold.moveTo.eraseLine.eraseLineAfter[color]( LINES.PLAYLIST[0], yPos, "%s#%s\t%s", isPlaying, index, item.title );
    yPos += 1;
  })
}

module.exports = { echo_input, echo_input_success, echo_instructions, echo_status, echo_playlist, echo_clear_playlist }