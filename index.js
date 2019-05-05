"use strict";
const term = require( 'terminal-kit' ).terminal;
const {
  echo_input,
  echo_input_success,
  echo_instructions,
  echo_status,
  echo_playlist
} = require('./echo_functions');

let STATE = {
  isAking: false,
  playingIndex: 0
};

let PLAYLIST = [];

function terminate() {
	setTimeout( function() { process.exit() } , 100 ) ;
}

function set_state(state){
  STATE = Object.assign({}, STATE, state);
}

function request_playlist_item() {
  set_state({isAsking: true});
  echo_input('Enter YouTube URL: ');
  term.inputField(function( error , input ) {
    PLAYLIST.push(input);
    echo_input_success("Added '%s'" , input);
    set_state({isAsking: false});
    echo_playlist(PLAYLIST, STATE.playingIndex);
  });
}

/**
 * Key bindings
 */
term.on( 'key' , function( name , matches , data ) {
  if ( name === 'CTRL_C' ) { terminate() ; }

  if( !STATE.isAsking ){
    if ( name === 'q' ) { terminate() ; }
    if ( name === 'a' ) { request_playlist_item() ; }
  }
} ) ;

/**
 * Init
 */
term.clear();
term.fullscreen();
echo_instructions('Keybindings: A: Add item to playlist | CTRL+C: QUIT');
echo_status('Add a YouTube URL to start playing');
request_playlist_item();