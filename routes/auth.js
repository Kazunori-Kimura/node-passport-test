//auth.js

module.exports = {
    success: function(req, res){
        console.log("token= %s", req.user.twitter_token);
        res.send('auth ok.');
    },
    failure: function(req, res){
        res.send('auth ng.');
    }
};
