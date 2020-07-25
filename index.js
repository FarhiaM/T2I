var Twit = require('twit');
var config = require('./config.js');
var T = new Twit(config);
var fs = require('fs');
var text2png = require('text2png');

console.log("Bot up and running...");

var stream = T.stream('statuses/filter', { track: '@tweet2image_bot' });
stream.on('tweet', tweetEvent);

function tweetEvent(tweet) {

    //Original tweet and author
    var tweet_mentioned_under = tweet.in_reply_to_status_id_str;
    var tweet_author = tweet.in_reply_to_screen_name;
    var txt = tweet.text;
    var mention = tweet.id_str;

    if (txt.includes('@tweet2image_bot')) {

        //Get text of the tweet we are mentioned in
        T.get('statuses/show/:id', { id: tweet_mentioned_under }, function(err, data) {

            var imageText = data.text + '\n \n @' + tweet_author;
            fs.writeFileSync('out.png', text2png(imageText, {
                font: '16px Roboto',
                color: 'black',
                backgroundColor: 'linen',
                lineSpacing: 7,
                textAlign: 'center',
                padding: 200,
                localFontPath: 'Roboto-Regular.ttf',
                localFontName: 'Roboto'
            }));

            var filePath = 'out.png';
            T.postMediaChunked({ file_path: filePath }, function(err, data, response) {

                if (err) {
                    console.log(err.message);
                }
            })

            var b64content = fs.readFileSync('out.png', { encoding: 'base64' })

            T.post('media/upload', { media_data: b64content }, function(err, data, response) {

                var mediaIdStr = data.media_id_string
                var meta_params = { media_id: mediaIdStr, alt_text: { text: imageText } }

                T.post('media/metadata/create', meta_params, function(err, data, response) {
                    if (!err) {
                        var params = {
                            status: '@' + tweet.user.screen_name + " ",
                            in_reply_to_status_id: '' + mention,
                            media_ids: [mediaIdStr]
                        }

                        T.post('statuses/update', params, function(err, data, response) {
                            console.log("Posted reply with image");
                        })
                    }
                })
                if (err) {
                    console.log(err.message);
                }
            })
        })

    }
}