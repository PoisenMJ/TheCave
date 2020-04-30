import React from 'react';
import Clock from 'react-live-clock';
import './App.css';

import spotify_image from './images/spotify.png';
import reddit_image from './images/reddit_signin.png';
import twitter_image from './images/twitter.png';

import Draggable from 'react-draggable';
import SpotifyWidget from './SpotifyWidget';
import {RedditWidget, RedditLogin} from './RedditWidget';
import TwitterWidget from './TwitterWidget';

import keys from './keys';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      spotifyAccessToken: '', 
      twitter: false,
    };
    // localStorage.setItem('spotifyAccessToken',)
    this.spotifyLogin = this.spotifyLogin.bind(this);
    this.twitterLogin = this.twitterLogin.bind(this);
    this.resize = this.resize.bind(this);
  }

  componentWillMount(){
    var params = this.getHashParams();
    var spotify_access = params.access_token;
    
    // TWITTER OAUTH
    if (params.oauth_verifier){
      var twitterSecondToken = params.oauth_token;
      var twitterVerifier = params.oauth_verifier;
      
      fetch(`http://localhost:3001/twitter/verify/${twitterSecondToken}/${twitterVerifier}`)
      .then(res => {
        res.text().then(data => {
          var d = JSON.parse(data);
          if(d.error !== "YES"){
            this.setState({ twitter: true });
            localStorage.setItem('twitterLoggedIn', 'true');
            localStorage.setItem('twitterData', JSON.stringify(d));
          }
        }); 
      })
    }
        //state = params.state, 
        //storedState = localStorage.getItem(this.stateKey);
    
    localStorage.setItem('spotifyAccessToken', spotify_access);
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
    var e, r, q;
    if(window.location.hash !== ""){
      r = /([^&;=]+)=?([^&;]*)/g;
      q = window.location.hash.substring(1);
    } else {
      r = /[(\?|\&)]([^=]+)\=([^&#]+)/g;
      q = window.location.search;
    }
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

  twitterLogin(){
    fetch('http://localhost:3001/twitter/login').then(res => {
      res.text().then(data => {
        var d = JSON.parse(data);
        // this.setState({ twitterToken: d.token, twitterSecret: d.secret });
        window.location = `https://api.twitter.com/oauth/authorize?oauth_token=${d.token}`
      });
    });
  }

  resize(){
    //console.log(this);
  }

  savePos(widgetName, x, y){
    localStorage.setItem(widgetName, x + ' ' + y);
  }

  getXPos(widgetName){
    if(localStorage.getItem(widgetName) != null){
      var s = localStorage.getItem(widgetName);
      return s.split(' ')[0];
    }
  }
  getYPos(widgetName){
    if(localStorage.getItem(widgetName) != null){
      return localStorage.getItem(widgetName).split(' ')[1];
    }
  }

  minimizeWidget(widgetName){
    console.log('hi');
    console.log(widgetName);
  }

  //
  // DOUBLE CLICK WIDGET TO HIDE
  // HAVE HOVER LITTLE BUTTON AT TOP LEFT WHICH WHEN HOVER SHOES HIDDEN WIDGET
  // OR HAVE WIDGETS HIDDEN ALREADY WHICH CAN BE ADDED
  // CLOCK WIDGET
  //
  //
  // REDDIT FEED
  // TOP LEFT CURRENT PLAYING TRACK AND PLAYBACK CONTROLS
  // TWITTER IMAGES ONLY LINKS RN
  // 

  render(){
    var twitter = false;
    if(localStorage.getItem('twitterLoggedIn') != null) twitter = localStorage.getItem('twitterLoggedIn');
    
    var twitterX = this.getXPos('twitterWidget'),
        twitterY = this.getYPos('twitterWidget');
    var redditX = this.getXPos('redditWidget'),
        redditY = this.getYPos('redditWidget');
    var spotifyX = this.getXPos('spotifyWidget'),
        spotifyY = this.getYPos('spotifyWidget');

    return (
        <div className="App">
          <div className="background"></div>
          <div id="main">
            <div id="header">
              <h3><Clock format={'HH:mm'} ticking={true}/></h3>
            </div>
            <div id="center">
              {localStorage.getItem('spotifyAccessToken') != null &&
                <Draggable bounds={'body'} handle={'.widgetHandle'} onStop={(e, d) => { this.savePos('spotifyWidget', e.clientX, e.clientY); }}>
                  <div className="widget"  onClick={this.resize} style={{position: 'absolute', top: `${spotifyY}px`, left: `${spotifyX}px`}}>
                    <div className="widgetHandle"></div>
                    <SpotifyWidget accessToken={localStorage.getItem('spotifyAccessToken')}></SpotifyWidget>
                  </div>
                </Draggable>    
              }
              <Draggable bounds={'body'} handle={'.widgetHandle'} onStop={(e, d) => { this.savePos('redditWidget', e.clientX, e.clientY); }}>
                <div className="widget" style={{height: 'auto', position: 'absolute', top: `${redditY}px`, left: `${redditX}px`}}>
                  <div className="widgetHandle"></div>
                  <RedditWidget></RedditWidget>
                </div>
              </Draggable>
              {twitter && 
                <Draggable bounds={'body'} handle={'.widgetHandle'} onStop={(e, d) => { this.savePos('twitterWidget', e.clientX, e.clientY); }}>
                  <div id="twitterWidgetParent" className="widget" style={{height: 'auto', position: 'absolute', top: `${twitterY}px`, left: `${twitterX}px`}}>
                    <div className="widgetHandle"></div>
                    {/* <div className="widgetMinimize"></div> */}
                    <TwitterWidget className='twitterWidget' data={JSON.parse(localStorage.getItem('twitterData'))}></TwitterWidget>
                  </div>
                </Draggable>
              }
            </div>
            <div id="footer">
              <div></div>
              <div id="socials">
                <img className="socialsImages" onClick={this.spotifyLogin} src={spotify_image} alt="Spotify Login"/>
                <img className="socialsImages" onClick={RedditLogin} src={reddit_image} alt="Reddit Login"/>
                <img className="socialsImages" onClick={this.twitterLogin} src={twitter_image} alt="Twitter Login"/>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

export default App;
