import React from 'react';
import './SpotifyWidget.css';
import axios from 'axios';

import play_button from './images/play_track.png';
import pause_button from './images/pause_track.png';
import prev_button from './images/prev_track.png';
import next_button from './images/next_track.png';
import refresh_button from './images/refresh.png';

class SpotifyWidget extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            accessToken: props.accessToken,
            spotifyPlaylists: [],
            spotifyPlaylistIDs: [],
            currentSpotifySongs: [],
            showSongs: false,
            showPlaylists: false,
            currentTrack: '',
            currentArtist: '',
            currentlyPlaying: false
        }
        this.goBack = this.goBack.bind(this);
        this.togglePlayback = this.togglePlayback.bind(this);
        this.playNextTrack = this.playNextTrack.bind(this);
        this.playPrevTrack = this.playPrevTrack.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);
    }

    componentWillMount(){
        this.getCurrentSong();
        if(localStorage.getItem('spotifyPlaylists') != null){
            if(localStorage.getItem('spotifyShowPlaylists') == 'true'){
                this.setState({ spotifyPlaylists: JSON.parse(localStorage.getItem('spotifyPlaylists')), 
                                spotifyPlaylistIDs: JSON.parse(localStorage.getItem('spotifyPlaylistIDs')), 
                                showPlaylists: true });
            } else if (localStorage.getItem('spotifyShowSongs') == 'true'){
                this.setState({ currentSpotifySongs: JSON.parse(localStorage.getItem('spotifySongs')), 
                                showSongs: true, showPlaylists: false });
            }
        } else {
            axios.get('https://api.spotify.com/v1/me/playlists',{
                headers:{
                    'Authorization': 'Bearer ' + this.state.accessToken
                }
            }).then((res) => {
                var ids = [];
                for(var i in res.data.items){
                    ids.push(res.data.items[i].href);
                }
                this.setState({ spotifyPlaylists: res.data.items, spotifyPlaylistIDs: ids, showPlaylists: true });
                localStorage.setItem('spotifyPlaylists', JSON.stringify(res.data.items));
                localStorage.setItem('spotifyPlaylistIDs', JSON.stringify(ids));
                localStorage.setItem('spotifyShowPlaylists', true);
            }).catch((err) => {
                console.log(err);
            });
        }
        
        // CHECKS EVERY 30 SECONDS (HALF A MIN) FOR CURRENT SONG PLAYING
        setInterval(() => {
            this.getCurrentSong();
        }, 1000 * 60 * 0.5)
    }

    getCurrentSong(){
        axios.get('https://api.spotify.com/v1/me/player', {
            headers:{
                'Authorization': 'Bearer ' + this.state.accessToken
            }
        }).then((res) => {
            // console.log(res.data);
            var artistName = res.data.item.artists[0].name;
            var trackName = res.data.item.name;
            var playing = res.data.is_playing;
            console.log('Currently Playing: ' + trackName + ' by ' + artistName);
            this.setState({ currentTrack: trackName, currentArtist: artistName, currentlyPlaying: playing });
        });
    }

    togglePlayback(){
        if(this.state.currentlyPlaying == true){
            // FOR SOME REASON AXIOS IS NOT WORKING SO HAD TO USE FETCH 
            fetch("https://api.spotify.com/v1/me/player/pause", {
                method: 'PUT',
                headers:{
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.state.accessToken
                }
            }).then((res) => {
                this.setState({ currentlyPlaying: false });
            });
        } else if (this.state.currentlyPlaying == false){
            fetch("https://api.spotify.com/v1/me/player/play", {
                method: 'PUT',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.state.accessToken
                }
            }).then((res) => {
                this.setState({ currentlyPlaying: true });
            });
        }
    }

    playNextTrack(){
        fetch("https://api.spotify.com/v1/me/player/next", {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.state.accessToken
            }
        }).then((res) => this.getCurrentSong());
    }

    playPrevTrack(){
        fetch("https://api.spotify.com/v1/me/player/previous", {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.state.accessToken
            }
        }).then((res) => this.getCurrentSong());
    }

    openSpotifyPlaylist(spotifyURI){
        axios.get(spotifyURI,{
            headers:{
                'Authorization': 'Bearer ' + this.state.accessToken
            }
        }).then((res) => {
            this.setState({currentSpotifySongs: res.data.tracks.items, showSongs: true, showPlaylists: false});
            localStorage.setItem('spotifySongs', JSON.stringify(res.data.tracks.items));
            localStorage.setItem('spotifyShowSongs', true);
            localStorage.setItem('spotifyShowPlaylists', false);
        }).catch((err) => {
            console.log(err);
        });
    }
    
    playSpotifyTrack(trackURI){
        fetch('https://api.spotify.com/v1/me/player/play',{
            method: 'PUT',
            body: JSON.stringify({ uris: [trackURI] }),
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.state.accessToken
            }
        }).then((res) => {
            console.log('Playing song: ' + trackURI);
        }).catch((err) => {
            console.log(err);
        });
    }

    goBack(){
        this.setState({ showPlaylists: true, showSongs: false });
        localStorage.setItem('spotifyShowPlaylists', 'true');
        localStorage.setItem('spotifyShowSongs', 'false');
    } 

    render(){
        let spotifyPlaylists = this.state.spotifyPlaylists ? this.state.spotifyPlaylists.map((playlist) => 
            <div className="spotify-block" key={playlist.name} onClick={() => {this.openSpotifyPlaylist(playlist.href)}}>
                <img className="spotify-cover circle" src={playlist.images[0].url}/>
                <div className="spotify-block-info">
                    <a href='#'>
                        <span className="text-light">{playlist.name}</span>
                    </a>
                </div>
            </div>
        ) : '';
        let singlePlaylist = this.state.currentSpotifySongs ? this.state.currentSpotifySongs.map((song) => 
            <div className="spotify-block" key={song.track.name} onClick={() => {this.playSpotifyTrack(song.track.uri)}}>
                <img className="spotify-cover circle" src={song.track.album.images[0].url}/>
                <div className="spotify-block-info">
                    <span className="text-light">{song.track.name}</span>
                </div>
            </div>
        ) : '';
        let content = this.state.showPlaylists ? spotifyPlaylists : this.state.showSongs ? singlePlaylist : null;
        
        return(
            <div className="spotify-widget">
                <div className="spotify-content">
                    {content}
                    {this.state.showSongs &&
                        <div className="spotify-block" onClick={this.goBack}>
                            <div></div>
                            <div className="spotify-block-info">
                                <span className="text-light">Go Back</span>
                            </div>
                        </div>       
                    }
                </div>
                <div className="spotify-playback">
                    <div className="spotify-playback-track lead">
                        <p className="font-weight-bold">{this.state.currentTrack}</p>
                        <p className="spotify-playback-track-artist">{this.state.currentArtist}</p>
                    </div>
                    <div className="spotify-playback-controls">
                        <img src={prev_button} onClick={this.playPrevTrack}/>
                        {this.state.currentlyPlaying
                            ? <img src={pause_button} onClick={this.togglePlayback}/>
                            : <img src={play_button} onClick={this.togglePlayback}/>
                        }
                        <img src={next_button} onClick={this.playNextTrack}/>
                    </div>
                <img className="spotify-playback-refresh" onClick={this.getCurrentSong} src={refresh_button}/>
                </div>
            </div>
        )
    }
}

export default SpotifyWidget;