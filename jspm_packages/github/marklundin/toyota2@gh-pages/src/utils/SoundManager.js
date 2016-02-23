//import {Howler, Howl} from "howler";

let soundMap = new Map();

let muteLooped = /\bmutelooped\b/.test(window.location.search);

let enabled = true;
let muted = false;

export default class SoundManager {
  static add(url) {
    let split = url.split("/");
    let name = split[split.length - 1].split(".")[0];
    if(soundMap.get(name)) {
      console.warn(`Sound ${name} is added twice`);
      return;
    }
    let sound = new Howl({
      urls: [url]
    });
    soundMap.set(name, sound);
  }

  static remove( key ){
    if( key === undefined ) soundMap.forEach(( v, k ) => SoundManager.remove( k ) )
    else {
      soundMap.get( key ).unload()
      soundMap.delete( key )
    }
  }

  static play(name, {loop = false, volume = 1} = {}) {
    let sound = soundMap.get(name);
    if(!sound) {
      console.error(`Sound ${name} hasn't been added`);
      return;
    }

    sound.loop(loop);
    sound.volume(volume || sound.volume);

    if(sound.loop() && muteLooped) {
      sound.mute();
    }
    sound.play();
  }
  static stop(name) {
    let sound = soundMap.get(name);
    sound.stop();
  }
  static set muted(value) {
    if(value) {
      muted = true;
      soundMap.forEach( sound => sound.mute() )
    } else {
      if(!enabled) {
        return;
      }
      muted = false;
      soundMap.forEach( sound => sound.unmute() )
    }
  }
  static get muted() {
    return muted;
  }
}

if(/\bmute\b/.test(window.location.search)) {
  enabled = false;
  Howler.mute()
}
