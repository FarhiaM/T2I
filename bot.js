var Twit = require('twit');
var config = require('./config.js');
var T = new Twit(config);
var fs = require('fs');
var text2png = require('text2png');

console.log("Bot up and running...");

var stream = T.stream('statuses/filter', { track: '@InstaStoryTweet' });
stream.on('tweet', tweetEvent);

function tweetEvent(tweet) {

    //Original tweet and author
    var tweet_mentioned_under = tweet.in_reply_to_status_id_str;
    var tweet_author = tweet.in_reply_to_screen_name;
    var txt = tweet.text;

    if (txt.includes('@InstaStoryTweet')) {

        //Get text of the tweet we are mentioned in
        T.get('statuses/show/:id', { id: tweet_mentioned_under }, function(err, data) {

            var imageText = data.text + '\n \n @' + tweet_author;
            fs.writeFileSync('out.png', text2png(imageText, {
                font: '16px Futura',
                color: 'black',
                backgroundColor: 'white',
                lineSpacing: 10,
                textAlign: 'center',
                padding: 300
            }));

            if (err) {
                console.log(err.message);
            }
        })

    }
}