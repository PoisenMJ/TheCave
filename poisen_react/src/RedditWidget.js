import React from 'react';
import './RedditWidget.css';
import axios from 'axios';
import reddit_image from './images/reddit.png';
import keys from './keys';
import Autosuggest from 'react-autosuggest';

export function RedditLogin(){
    var url = 'https://ssl.reddit.com/api/v1/authorize?';
    url += '&client_id=' + encodeURIComponent(keys.reddit.CLIENT_ID);
    url += '&response_type=code';
    url += '&state=asfaasdfasdf';
    url += '&redirect_uri=' + encodeURIComponent(keys.reddit.REDIRECT_URI);
    url += '&duration=permanent';
    url += '&scope=' + keys.reddit.SCOPE;
    window.location = url;
}

export class RedditWidget extends React.Component{
    constructor(props){
        super(props);
        this.state = { accessToken: '', refreshToken: '', subreddits: [],
            value: '',
            suggestions: []
        };
    }
    
    componentDidMount(){
        var params = this.getHashParams();
        // GET NUMBER OF KEYS IN OBJECT (NO LENGTH METHOD FOR OBJECT)
        if (Object.keys(params).length > 0){
            var token = params.code;
            this.setState({ accessToken: token });
            this.getAccessToken(token);
        }
    }

    getAccessToken(token){
        fetch(`http://localhost:3001/${token}`).then((res) => {
            res.text().then(data => {
                var d = JSON.parse(data);
                this.setState({ accessToken: d.access_token, refreshToken: d.refresh_token }, () => {
                    this.getSubscribedSubreddits();
                });
            });
        }).catch((err) => {
            console.log(err);
        });
    }

    getHashParams() {
        var hashParams = {};
        var e = /(\?|\&)([^=]+)\=([^&]+)/g,
            q = window.location.search, result;
        while ( result = e.exec(q)) {
            // RESULT [1] = CHARACTER BEFORE
            // RESULT [2] = PARAM NAME (CODE)
            // RESULT [3] = PARAM VALUE (LPAKSDJF)
            hashParams[result[2]] = result[3];
        }
        return hashParams;
    }

    getSubscribedSubreddits(){
        var url = "https://oauth.reddit.com/subreddits/mine/subscriber";
        var access_token = this.state.accessToken;
        var headers = {"Authorization": "bearer " + access_token};
        var params = {"limit": "100", "show": "all"};
        axios.get(url, {headers,params}).then((res) => {
            var subreddits = res.data.data.children;
            var names = [];
            for(var i = 0; i < subreddits.length; i++){
                var current = subreddits[i].data.display_name;
                names.push(current);
            }
            this.setState({ subreddits: names });
        }).catch((err) => {
            console.log(err);
        });
    }

    getOtherSubreddit(subreddit){
        
    }

    onChange = (event, { newValue, method }) => {
        if(method == 'type'){
            this.setState({
                value: newValue
            });
        } else if (method == 'enter'){
            console.log('enter');
        }
    };

    getSuggestions = value => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        if(inputLength === 0) return [];
        else{
            var items = this.state.subreddits.filter(sub => sub.toLowerCase().slice(0, inputLength) === inputValue);
            return items;
        }
    };

    getSuggestionValue = suggestion => suggestion.name;  
    renderSuggestion = suggestion => (
        <div>
            {suggestion}
        </div>
    );
    
      // Autosuggest will call this function every time you need to update suggestions.
      // You already implemented this logic above, so just use it.
    onSuggestionsFetchRequested = ({ value }) => {
        if (value) {
            this.setState({
                suggestions: this.getSuggestions(value)
            });
        }
    };
    
      // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    onSuggestionSelected = (event, { suggestion }) => {
        this.setState({
            value: suggestion
        })
    }

    formSubmit(event){ 
        event.preventDefault();

    }

    render(){
        const { value, suggestions } = this.state;

        const inputProps = {
            placeholder: 'Subreddit',
            value,
            onChange: this.onChange
        };

        return(
            <div className="reddit-search">
                <img className="reddit-logo" src={reddit_image}></img>
                    <form id="redditForm" onSubmit={this.formSubmit} action="#">
                        <div className="input-group">
                            <div className="input-group-prepend">
                                <span className="input-group-text">
                                r/
                                </span>
                            </div>
                            <Autosuggest
                                suggestions={suggestions}
                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                onSuggestionSelected={this.onSuggestionSelected}
                                getSuggestionValue={this.getSuggestionValue}
                                renderSuggestion={this.renderSuggestion}
                                inputProps={inputProps}
                            />
                            {/* <input id="redditName" className="form-control" type="text" onChange={evt => this.inputChange(evt)} /> */}
                            <input type="button" hidden />
                        </div>
                    </form>
            </div>
        )
    }
}