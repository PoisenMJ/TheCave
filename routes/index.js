var express = require('express');
var router = express.Router();
var request = require('request');
var querystring = require('querystring');
var keys = require('../keys.js');
var oauthsignature = require('oauth-signature');
var twit = require('twit');

var T;

router.get('/reddit/:token', (req, res, next) => {
  var postData = querystring.stringify({"grant_type": "authorization_code",                                                                                 
              "code": req.params.token,
              "redirect_uri": "http://localhost:3000"});
  request({
    url:'https://ssl.reddit.com/api/v1/access_token',
    method: 'POST',
    auth: {
      user: keys.reddit.CLIENT_ID,
      password: keys.reddit.CLIENT_SECRET
    },
    headers: {
      'User-Agent': 'android:com.example.myredditapp:v1.2.3 (by /u/kemitche)',
    },
    body: postData
  }, (err, response, body) => {
    if(err){
      res.send('EMPTY');
    }
    else{
      res.send(body);
    }
  });
});

function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

router.get('/twitter/login', (req, res, next) => {
  console.log('TWITTER LOGIN SECOND STEP:');
  var timestamp = Math.floor(new Date().getTime() / 1000);
  // var timestamp = '1583151031';
  var nonce = makeid(11);
  // var nonce = 'xufQ7Avzxz8';

  var parameters = {
    oauth_consumer_key: keys.twitter.CLIENT_ID,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: `${timestamp}`,
    oauth_nonce: `${nonce}`,
    oauth_version: "1.0",
  }; 
  var consumerSecret = keys.twitter.CLIENT_SECRET;
  var method = 'POST';
  var url = 'https://api.twitter.com/oauth/request_token';
  // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
  var encodedSignature = oauthsignature.generate(method, url, parameters, consumerSecret);
  // var signature = oauthsignature.generate(method, url, parameters, consumerSecret, { encodedSignature: false });

  var authHeaders =  
  `OAuth oauth_consumer_key="${keys.twitter.CLIENT_ID}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_nonce="${nonce}",oauth_version="1.0",oauth_signature="${encodedSignature}"`;
  
  var options = {
    'method': 'POST',
    'url': url,
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded',
      'oauth_callback': 'https://localhost:3000',
      'Authorization': authHeaders      
    },
    form: {
  
    }
  };
  request(options, (error, response, body) => { 
    if (error) {
      console.log(error);
    }
    else {
      console.log(querystring.parse(body));
      var token = querystring.parse(body).oauth_token;
      var secret = querystring.parse(body).oauth_token_secret;
      // console.log(token);
      // console.log(secret);
      res.send({token, secret});
    }
  });
});

router.get('/twitter/verify/:token/:verify', (req, res, next) => {
  console.log('TWITTER VERIFY LOGIN:LAST STEP');
  var token = req.params.token, verify = req.params.verify;
  var url = `https://api.twitter.com/oauth/access_token?oauth_consumer_key=${keys.twitter.CLIENT_ID}&oauth_token=${token}&oauth_verifier=${verify}`;
  var options = {
    method: 'POST',
    url: url,
  };
  request(options, (error, response, body) => {
    if(error) console.log(error)
    else{
      var data = querystring.parse(body);
      if(response.statusCode == 200){
        // SET UP TWITTER HELPER MODULE
        if(data.oauth_token){
          T = new twit({
            consumer_key: keys.twitter.CLIENT_ID,
            consumer_secret: keys.twitter.CLIENT_SECRET,
            access_token: data.oauth_token,
            access_token_secret: data.oauth_token_secret
          });
      }else res.send({"error": "YES"});
        res.send(data);
      }
      else{
        res.send({"error": "YES"});
      }
    }
  })
}); 

router.get('/twitter/timeline/:name', (req, res, next) => {
  console.log('TWITTER GET USER HOME TIMELINE:');
  if(T){
    T.get('statuses/home_timeline', (err, response, data) => {
      if(err) console.log(err);
      else{
        var timeline = []; 
        for (var i = 0; i < response.length; i++){
          var current = {};
          current.text = response[i].text;
          current.source = response[i].source;
          current.user = response[i].user;
          console.log(response[i]);
          timeline.push(current);
        }
        res.send(JSON.stringify(timeline));
      } 
    });
  } else res.send(JSON.stringify({'code': 'fail'})); 
});

router.get('/twitter/search/:query',(req, res, next) => {
  T.get('search/tweets', { q: req.params.query, lang: 'en', count: '20', result_type: 'popular' } ,(err, response, data) => {
    if(err) console.log(err);
    var data = [];
    for (var i = 0; i < response.statuses.length; i++){
      var current = {};
      current.text = response.statuses[i].text;  
      current.source = response.statuses[i].source;
      current.user = response.statuses[i].user;
      data.push(current);
    }
    res.send(JSON.stringify(data));
  });
});

module.exports = router;
