var express = require('express');
var router = express.Router();

 var binaryServer = require('binaryjs').BinaryServer,
     https = require('https'),
     fs = require('fs'),
     connect = require('connect'),
     UAParser = require('./ua-parser'),
     //lame = require('lame'),
     watson = require('watson-developer-cloud'),
     SpeakerStream = require('./speaker-stream'),
     WebSocket = require('websocket').w3cwebsocket,
     Url = require('url'),
     portfinder = require('portfinder'),
     utterance = require('./utterance').Utterance;

var natural = require('natural');

var uuid = require('node-uuid');

const keywords = require("./keywords");

const speech_to_text = new watson.SpeechToTextV1({
  "url": "https://stream.watsonplatform.net/speech-to-text/api",
  "username": "85228eb7-fcf6-4a8b-852b-dbacd73904ae",
  "password": "SvwquH2lrF4s"
});
const speech_to_text2 = new watson.SpeechToTextV1({
  "url": "https://stream.watsonplatform.net/speech-to-text/api",
  "username": "85228eb7-fcf6-4a8b-852b-dbacd73904ae",
  "password": "SvwquH2lrF4s"
});
const nlu = new watson.NaturalLanguageUnderstandingV1({
    "url": "https://gateway.watsonplatform.net/natural-language-understanding/api",
    "username": "470ee6ba-adcb-4c4d-9125-42aec261cd44",
    "password": "bv0C5gJEz2lx",
    "version_date": "2017-02-27"
  });

        var stt_params = {
            continuous: true,
            content_type: "audio/l16;rate=16000",
            speaker_labels: true,
            objectMode: true,
            action: "start",
            interim_results: false,
            profanity_filter: false,
            word_alternatives_threshold: 0.2,
            keywords: keywords,
            keywords_threshold: 0.2,
            inactivity_timeout: 5
        };
        var stt_params2 = {
            continuous: true,
            content_type: "audio/l16;rate=16000",
            //speaker_labels: true,
            word_alternatives_threshold: 0.2,
            objectMode: true,
            action: "start",
            interim_results: true,
            profanity_filter: false,
            inactivity_timeout: 5
        };

        var recognizeStream = null;
        var recognizeStreamInterim = null;
        const googleSpeech = require('@google-cloud/speech');
        
          // Instantiates a client
          const speech_to_textGoogle = googleSpeech({
                projectId: 'AIH-Speaker-Identifier',
                keyFilename: './AIH-Speaker-Identifier-729e234a463b.json',
                speech_contexts: keywords
            });
            speech_to_textGoogle
          // The path to the local file on which to perform speech recognition, e.g. /path/to/audio.raw
          // const filename = '/path/to/audio.raw';
        
          // The encoding of the audio file, e.g. 'LINEAR16'
          const encoding = 'LINEAR16';
        
          // The sample rate of the audio file in hertz, e.g. 16000
          const sampleRateHertz = 16000;
        
          // The BCP-47 language code to use, e.g. 'en-US'
          const languageCode = 'en-US';
        
          const googleRequest = {
            config: {
              encoding: encoding,
              sampleRateHertz: sampleRateHertz,
              languageCode: languageCode
            },
            interimResults: false
        };
        var googleRecognizeStream;
          // Stream the audio to the Google Cloud Speech API
          

 var uaParser = new UAParser();

var options = {
    key:    fs.readFileSync('ssl/key.pem'),
    cert:   fs.readFileSync('ssl/cert.pem'),
};

var timeoutMS = 7000;

var utterenceCount = 0;



var sessionWriteStream = "";
var writeStream = "";

var sessionWriteStreamGoogle = "";
var writeStreamGoogle = "";
var lastUtteranceGoogle = "";
var stopOnNextResultGoogle = false;
var streamTimer;
var streamStarted = false;

var httpsServer;
var server;
var clientPort;
var clientId;
var sessionId;

router.get('/', function(req, res, next) {

  portfinder.getPort(function (err, port) {



    clientPort = port;
    console.log(clientPort);

    var url = Url.parse(req.url, true);

    sessionId = req.sessionId;

    //first we need a https server instance attached to this port
    //it is used for the websocket upgrade for testing in a browser
    httpsServer = https.createServer(options);
    httpsServer.listen(clientPort);


    server = binaryServer({server:httpsServer});
    serverTimeout(server);

    //console.log(httpsServer)

    server.on('connection', function(client) {
    console.log("new connection...");
    writeStream = "";
    writeStreamGoogle = "";
    writeStreamGoogleFinal = "";
    //clearInterval(streamTimer);
    timeoutMS = 7000;
    utterenceCount = 0;
    //streamStarted = false;
    

    var userAgent  =client._socket.upgradeReq.headers['user-agent'];
    uaParser.setUA(userAgent);
    var ua = uaParser.getResult();


    stt_params.action = "start";
    stt_params2.action = "start";
    
    recognizeStream = setupStream(speech_to_text, stt_params, client);
    recognizeStreamInterim = setupInterimStream(speech_to_text2, stt_params2, client);
    googleRecognizeStream = setupGoogleStream(googleRequest, client);
    // googleRecognizeStream = speech_to_textGoogle.streamingRecognize(request)
    //     .on('error', console.error)
    //     .on('data', (data) => {
    //     console.log(
    //         'Transcription:', data.results[0].alternatives[0].transcript);
    //         console.log(JSON.stringify(data, 4));
    //     });

    if(streamStarted == false) {
        sessionWriteStream = "";
        console.log('stream start');
        streamStarted = true;
        clearInterval(streamTimer);
        streamTimout(client);
    }


    client.on('stream', function(stream, meta) {
        stream
        .pipe(recognizeStreamInterim);

        stream
        .pipe(recognizeStream);



        stream
        .pipe(googleRecognizeStream);

    });

    
    client.on('close', function() {
        console.log("Connection Closed");
        clearInterval(streamTimer);
        setTimeout(function() {
        if(!streamStarted)
            return

        stopOnNextResultGoogle = true;
        stopStream(recognizeStreamInterim, stt_params2, speech_to_text2);
        stopStream(recognizeStream, stt_params, speech_to_text);
        streamStarted = false;
        } , 2000);

    });
});
    res.type('json');
    res.send({ sessionId: req.sessionId, port: clientPort });
    //
  }); 

});

var serverTimer;
function serverTimeout() {
    self = this;
    //console.log("timer started:", streamTimer)
    
    serverTimer = setInterval(function(){
        httpsServer.close();
        clearInterval(serverTimer)
        console.log("stt server closed on port: ", clientPort)
            server.close();
        } , 300000);
}
function streamTimout(client) {
    self = this;
    //console.log("timer started:", streamTimer)
    streamTimer = setInterval(function(){
            console.log("timer activated:", "streamStarted:", streamStarted)
            

            try {
            stopStream(recognizeStreamInterim, stt_params2, speech_to_text2);
            client.send({message: "awaiting final results"});
            stopStream(recognizeStream, stt_params, speech_to_text);
            googleRecognizeStream.end();
            streamStarted = false;
            clearInterval(streamTimer);
            }
                catch(error) {
                    console.log("client already terminated");
                };
        } , timeoutMS);
}

function setupGoogleStream(request, client) {
    console.log("setup stream");
    var googleStream = speech_to_textGoogle.streamingRecognize(request)
        .on('error', function(event) { onGoogleEvent('Error:', event, client); })
        .on('close', function(event) { onGoogleEvent('Close:', event, client); })
        .on('data', function(event) { onGoogleEvent('Data:', event, client); });
    
    stopOnNextResultGoogle = false;

    return googleStream
}
function setupStream(sttObj, sttParams, client) {
        console.log("setup stream");
        var watsonStream = sttObj.createRecognizeStream(sttParams);

        watsonStream.setEncoding('utf8');

        watsonStream.on('error', function(event) { onEvent('Error:', event, client); });
        watsonStream.on('close', function(event) { onEvent('Close:', event, client); });
        watsonStream.on('speaker_labels', function(event) { onEvent('Speaker_Labels:', event, client); });

        return watsonStream
}
function setupInterimStream(sttObj, sttParams, client) {
        console.log("setup inerim stream");

        var watsonStream = sttObj.createRecognizeStream(sttParams);

        watsonStream.setEncoding('utf8');

        watsonStream.on('results', function(event) { onInterimEvent('Results:', event, client); });
        watsonStream.on('data', function(event) { onInterimEvent('Data:', event, client); });
        watsonStream.on('error', function(event) { onInterimEvent('Error:', event, client); });
        watsonStream.on('close', function(event) { onInterimEvent('Close:', event, client); });
        //watsonStream.on('speaker_labels', function(event) { onInterimEvent('Speaker_Labels:', event, client); });
        
        return watsonStream
}
function stopStream(watsonStream, params, sttObj) {
        if(!streamStarted)
            return

        try {
        var stop = {'action': 'stop'};
        watsonStream.socket.send(JSON.stringify(stop));
        }
        catch(e) {
            console.log("ws stream already closed");
        }
        return
}
function stopStreamGoogle(watsonStream, params, sttObj) {
    if(!streamStarted)
        return

    
        stopOnNextResultGoogle = true;

    return
}
function onEvent(name, event, client) {
    //console.log(name);

    if(typeof(event) == "object")
        //console.log(event);
    var returnText;
    
    if(name = "Speaker_Labels:") {
        if(typeof(event.speaker_labels) == "object" && typeof(event.results) == "object") {
            console.log("final result");

            var speakerStream = new SpeakerStream();
            speakerStream.results = event.results;

            speakerStream.speaker_labels = event.speaker_labels;


            
            var returnResults = {};
            var extendedResults = {};
            returnResults.sessionId = sessionId;
            var speakersOutput = [];
            try {
            var speakerData = speakerStream.buildMessage();
            //console.log(speakerData);
            var edititedTranscript = "";
             for(var result = 0; result < speakerData.results.length; result++) {
                var keywords = []; 
                if (speakerData.results[result].keywords_result) {
                     keywords = Object.keys(speakerData.results[result].keywords_result);
                    //  for(var keyword = 0; keyword < keywords.length; keyword++) {
                    //     console.log(keywords[keyword])
                    // }
                    
                 }
                speakersOutput.push({"speaker": speakerData.results[result].speaker, "text": speakerData.results[result].alternatives[0].transcript, "keyword_result": keywords});
                if(result != 0)
                    edititedTranscript += " ";

                edititedTranscript += speakerData.results[result].alternatives[0].transcript;
                 
            }


            returnResults.sttSource = "Watson";
            returnResults.resultsType = "final";
            returnResults.speakerData = speakersOutput;
            returnResults.transcript = edititedTranscript;


            returnResults.comparisonScore = natural.LevenshteinDistance(edititedTranscript, writeStreamGoogle)
            

            clearInterval(streamTimer);
            clearInterval(serverTimer);
            serverTimeout();
            
            if(typeof(client) == "object" && typeof(client.streams[Object.keys(client.streams)[0]]) == "object")
                client.send(returnResults);


            } catch (e) {
                console.log(e);
            };
            
        }
    }
    if(name = "Data:") {

        //console.log(event);
        if(typeof(event) == "object") {
            return;
        }
        //console.log(recognizeStreamInterim);
        if(typeof(client) == "object")
            //console.log(client);
            if(typeof(client.streams[Object.keys(client.streams)[0]]) == "object")
                client.send({text: event});
    }
    if(name = "Close:") {
        console.log("final stream closed");
        client.close();
    }
};
function onInterimEvent(name, event, client) {
    if(!streamStarted)
        return
    //console.log(name);

    //console.log(JSON.stringify(event, null, 6));
    var returnText;
    if(name = "Results:") {
        
        //look for keywords here
        
            clearInterval(streamTimer);
            timeoutMS = 5000;
            streamTimout(client);
            clearInterval(serverTimer);
            serverTimeout();
        
    }
    if(name = "Data:") {
        //console.log("timer cleared", streamTimer)
        
        if(typeof(event) == "object") {
            return;
        }

        //console.log(event);

        if(typeof(client) == "object" && typeof(event) == "string") {
            //console.log(client);
            if(typeof(client.streams[Object.keys(client.streams)[0]]) == "object") {
                writeStream += event;
                sessionWriteStream += event;
                var currentUtterance = new utterance(writeStream, nlu);
                currentUtterance.getSemanticRoles(function(err,response){
                    if(!streamStarted)
                    return;
                    if (err) {
                        console.log("error: ", err);
                        client.send({sttSource: "Watson", sessionId: sessionId, lastUtterence: event, transcript: writeStream, partsOfSpeech: currentUtterance.partsOfSpeech});
                    }
                    else {
                        console.log("NLU Response");
                        console.log(response);
                        client.send({sttSource: "Watson", sessionId: sessionId, lastUtterence: event, transcript: writeStream, partsOfSpeech: currentUtterance.partsOfSpeech, semanticRoles: response});
                        
                    }
                });
                clearInterval(streamTimer);
                timeoutMS = 5000;
                streamTimout(client);
                //console.log(writeStream);
            }
        }
    }
    if(name = "Close:") {
        console.log("interim stream closed");
    }
};
function onGoogleEvent(name, event, client) {
    if(!streamStarted)
        return
    //console.log(name);

    //console.log(JSON.stringify(event, null, 6));
    var returnText;
    if(name = "Results:") {
        
        //look for keywords here
        
            clearInterval(streamTimer);
            timeoutMS = 5000;
            streamTimout(client);
            clearInterval(serverTimer);
            serverTimeout();
        
    }
    if(name = "Data:") {
        //console.log("timer cleared", streamTimer)
        
        var data = event;

        //console.log(event);

        if(typeof(client) == "object") {
            
            if(typeof(client.streams[Object.keys(client.streams)[0]]) == "object") {
                console.log(JSON.stringify, data);
                if(data.results[0].isFinal) {
                        writeStreamGoogleFinal += data.results[0].alternatives[0].transcript;
                        writeStreamGoogle = writeStreamGoogleFinal;
                }
                else {
                    writeStreamGoogle += data.results[0].alternatives[0].transcript;
                }
                sessionWriteStreamGoogle += data.results[0].alternatives[0].transcript;
                
                clearInterval(streamTimer);
                timeoutMS = 5000;
                streamTimout(client);

                var currentUtterance = new utterance(writeStreamGoogle, nlu);
                currentUtterance.getSemanticRoles(function(err,response){
                    if(!streamStarted)
                        return;
                    if (err) {
                        console.log("error: ", err);
                        client.send({sttSource: "Google", sessionId: sessionId, lastUtterence: data.results[0].alternatives[0].transcript, transcript: writeStreamGoogle, partsOfSpeech: currentUtterance.partsOfSpeech});
                    }
                    else {
                        console.log("NLU Response");
                        console.log(response);
                        client.send({sttSource: "Google", sessionId: sessionId, lastUtterence: data.results[0].alternatives[0].transcript, transcript: writeStreamGoogle, partsOfSpeech: currentUtterance.partsOfSpeech, semanticRoles: response});
                        if(stopOnNextResultGoogle) {
                            googleRecognizeStream.end();
                        }
                    }
                });
                console.log(writeStreamGoogle);
            }
        }
    }
    if(name = "Close:") {
        console.log("google stream closed");
    }
};
module.exports = router;
