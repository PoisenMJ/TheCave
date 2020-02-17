import React from 'react';
import './SpotifyWidget.css';
import axios from 'axios';

class SpotifyWidget extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            accessToken: props.accessToken,
            spotifyPlaylists: [],
            spotifyPlaylistIDs: [],
            currentSpotifySongs: [],
            showSongs: false,
            showPlaylists: false
        }
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
        }).catch((err) => {
            console.log(err);
        });
        this.goBack = this.goBack.bind(this);
    }

    openSpotifyPlaylist(spotifyURI){
        axios.get(spotifyURI,{
            headers:{
                'Authorization': 'Bearer ' + this.state.accessToken
            }
        }).then((res) => {
            this.setState({currentSpotifySongs: res.data.tracks.items, showSongs: true, showPlaylists: false});     
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
                {content}
                {this.state.showSongs &&
                    <div className="spotify-block" onClick={this.goBack}>
                        <div></div>
                        <div className="spotify-block-info">
                            <span className="text-light">Go Back.</span>
                        </div>
                    </div>       
                }
            </div>
        )
    }
}

export default SpotifyWidget;