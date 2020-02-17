var express = require('express');
var router = express.Router();
var request = require('request');
var querystring = require('querystring');
var keys = require('../keys.js');

router.get('/:token', (req, res, next) => {
  postData = querystring.stringify({"grant_type": "authorization_code",                                                                                 
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

module.exports = router;
