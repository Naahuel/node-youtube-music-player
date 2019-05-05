#!/usr/bin/env node

"use strict";
const term = require( 'terminal-kit' ).terminal;
const { spawn } = require( 'child_process' );
let PLAYER = null;

const {
  echo_input,
  echo_instructions,
  echo_status,
  echo_playlist,
  echo_clear_playlist
} = require('./echo_functions');

let STATE = {
  isAking: false,
  isPlaying: false,
  playingIndex: -1,
  lastPlayedIndex: -1
};

let PLAYLIST = [];

function terminate() {
  /** Terminate program */
	setTimeout( function() { process.exit() } , 100 ) ;
}

function set_state(state){
  /** Update the program's state */
  STATE = Object.assign({}, STATE, state);
}

function play_next(){
  if( STATE.playingIndex < PLAYLIST.length - 1){
    set_state({
      playingIndex: STATE.playingIndex + 1
    });
    play_song(STATE.playingIndex);
  }
}
function play_prev(){
  if( STATE.playingIndex > 0 ) {
    set_state({
      playingIndex: STATE.playingIndex - 1
    });
    play_song(STATE.playingIndex);
  }
}

function play_song(index){
  set_state({
    playingIndex: index,
    isPlaying: true,
    lastPlayedIndex: index
  });

  echo_playlist(PLAYLIST, STATE.playingIndex);
  let playItem = PLAYLIST[STATE.playingIndex];
  if( playItem ) {
    if( PLAYER ){
      PLAYER.kill();
    }

    PLAYER = spawn( 'mpv', [ '--no-video', playItem ] );

    PLAYER.stdout.on( 'data', data => {
      let str = data.toString(), lines = str.split(/(\r?\n)/g);
      if( !STATE.isAsking ){
        echo_status('Loading #%s | %s', STATE.playingIndex, lines[0]);
      }
    });

    PLAYER.stderr.on( 'data', data => {
      let str = data.toString(), lines = str.split(/(\r?\n)/g);
      if( !STATE.isAsking ){
        echo_status('Playing #%s | %s', STATE.playingIndex, lines[0]);
      }
    });

    PLAYER.on( 'close', code => {
      if( code !== 4 ){
        PLAYER = null;
        if( PLAYLIST.length === (STATE.playingIndex + 1) ) {
          echo_status('Finished playing.');
          set_state({
            isPlaying: false,
            playingIndex: -1
          });
          echo_playlist(PLAYLIST, STATE.playingIndex);
        } else {
          play_next();
        }
      }
    });
  } else {
    echo_status('Finished playing.');
    echo_playlist(PLAYLIST, STATE.playingIndex);
  }
}

function request_add_item() {
  /** Request a URL to the user */
  set_state({isAsking: true});
  echo_input('Enter YouTube URL: ');
  term.inputField(function( error , input ) {
    echo_input('');
    set_state({isAsking: false});
    if( input.trim() ){
      PLAYLIST.push(input.trim());
      echo_playlist(PLAYLIST, STATE.playingIndex);
      if( !STATE.isPlaying && STATE.lastPlayedIndex !== -1 ) {
        // We were playing songs and finished
        // Play this one we just added
        play_song(STATE.lastPlayedIndex + 1);
      }else if( STATE.playingIndex == -1 ) {
        // We had no songs. Play the first one now!
        play_song(0);
      }
    }
  });
}

function request_delete_item() {
  /** Request delete a playlist item */
  set_state({isAsking: true});
  echo_input('Enter index of item to remove: #');
  term.inputField(function( error , input ) {
    echo_clear_playlist(PLAYLIST);
    PLAYLIST.splice(input, 1);
    echo_input('');
    set_state({isAsking: false});
    echo_playlist(PLAYLIST, STATE.playingIndex);
  });
}

function request_play_item() {
  /** Request play a playlist item */
  set_state({isAsking: true});
  echo_input('Enter index of item to play: #');
  term.inputField(function( error , input ) {
    echo_input('');
    set_state({isAsking: false});
    let index = parseInt(input);
    if( index >= 0 && index < PLAYLIST.length  ){
      play_song(index);
    }
  });
}

/**
 * Key bindings
 */
term.on( 'key' , function( name , matches , data ) {
  if ( name === 'CTRL_C' ) { terminate() ; }

  if( !STATE.isAsking ){
    if ( name === 'q' ) { terminate() ; }
    if ( name === 'a' ) { request_add_item() ; }
    if ( name === 'd' ) { request_delete_item() ; }
    if ( name === 'i' ) { request_play_item() ; }
    if ( name === 'n' ) { play_next() ; }
    if ( name === 'p' ) { play_prev() ; }
  }
} ) ;

/**
 * Init
 */
term.clear();
term.fullscreen();
echo_instructions('KEYS: A: Add item | D: Delete item | N: Next | P: Prev | I: Play index | SPACE: pause/play | Q: Quit');
echo_status('Add a YouTube URL to start playing');
request_add_item();