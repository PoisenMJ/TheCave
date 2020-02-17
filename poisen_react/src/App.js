import React from 'react';
import './App.css';

import spotify_image from './images/spotify.png';
import reddit_image from './images/reddit_signin.png';
import './js/index';

import axios from 'axios';

import Draggable from 'react-draggable';
import SpotifyWidget from './SpotifyWidget';
import {RedditWidget, RedditLogin} from './RedditWidget';

import keys from './keys';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      spotifyAccessToken: '', 
      spotifyPlaylists: [], 
      spotifyPlaylistIDs: [],
      currentSpotifySongs: [],
      showSongs: false,
      showPlaylist: false
    };
    this.spotifyLogin = this.spotifyLogin.bind(this);
    this.resize = this.resize.bind(this);
  }

  componentDidMount(){
    var params = this.getHashParams();
    var spotify_access = params.access_token;
        //state = params.state,
        //storedState = localStorage.getItem(this.stateKey);
    this.setState({spotifyAccessToken: spotify_access, showPlaylist: true, showSongs: false});
  }

  generateRandomString(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
  
  /**
   * Obtains parameters from the hash of the URL
   * @return Object
   */
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }
  
  spotifyLogin(){
    var state = this.generateRandomString(16);
    var stateKey = 'spotify_auth_state';
    localStorage.setItem(stateKey, state);
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(keys.spotify.CLIENT_ID);
    url += '&scope=' + encodeURIComponent(keys.spotify.SCOPE);
    url += '&redirect_uri=' + encodeURIComponent(keys.spotify.REDIRECT_URI);
    url += '&state=' + encodeURIComponent(keys.spotify.SCOPE);
    window.location = url;
  }

  redditLogin(){
    var url = 'https://www.reddit.com/api/v1/authorize?';
    url += '&client_id=' + encodeURIComponent(keys.reddit.CLIENT_ID);
    url += '&response_type=code';
    url += '&state=asfaasdfasdf';
    url += '&redirect_uri=' + encodeURIComponent(keys.reddit.REDIRECT_URI);
    url += '&duration=permanent';
    url += '&scope=' + keys.reddit.SCOPE;
  }

  resize(){
    //console.log(this);
  }

  //
  // DOUBLE CLICK WIDGET TO HIDE
  // HAVE HOVER LITTLE BUTTON AT TOP LEFT WHICH WHEN HOVER SHOES HIDDEN WIDGET
  // OR HAVE WIDGETS HIDDEN ALREADY WHICH CAN BE ADDED
  // CLOCK WIDGET
  // 

  render(){
    return (
        <div className="App">
          <div className="background"></div>
          <div id="main">
            <div id="header">
              <h1> Poisen's Cave <span className="lead">(10:05)</span></h1>
            </div>
            <div id="center">
              {this.state.spotifyAccessToken &&
                <Draggable>
                  <div className="widget"  onClick={this.resize}>
                    <SpotifyWidget accessToken={this.state.spotifyAccessToken}></SpotifyWidget>
                  </div>
                </Draggable>    
              }
              <Draggable>
                <div className="widget" style={{height: '10%'}}>
                  <RedditWidget></RedditWidget>
                </div>
              </Draggable>
            </div>
            <div id="footer">
              <div></div>
              <div id="socials">
                <img className="socialsImages" onClick={this.spotifyLogin} src={spotify_image} alt="Spotify Login"/>
                <img className="socialsImages" onClick={RedditLogin} src={reddit_image} alt="Reddit Login"/>
                <img className="socialsImages" onClick={this.spotifyLogin} src={spotify_image} alt="Spotify Login"/>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

export default App;
