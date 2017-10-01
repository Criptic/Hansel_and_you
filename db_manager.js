/**
 * Copyright 2013. Amazon Web Services, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/

// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('node-uuid');
const Fs = require('fs');
//load aws config
AWS.config.loadFromPath('./config.json');

var stringToInt = function(string) {
    var y = 0;
    var c = 0.01;
    console.log("string in stringToInt method", string);
    for(var i=0;i<string.length;i++) {
        c *= 100;
        y+= (string.charCodeAt(i) * c);
    }
    return y.toString();
}
var createAudioFilesTable = function() {
var dynamodb = new AWS.DynamoDB();
var params_ddb = {
    TableName : "stories_audio_files2",
    KeySchema: [
        {AttributeName: "id", KeyType: "HASH"}
    ],
    AttributeDefinitions: [
        {AttributeName: "id", AttributeType: "N"}
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
dynamodb.createTable(params_ddb, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
};
var createTextDB = function() {
var dynamodb = new AWS.DynamoDB();
var params_ddb_texts = {
    TableName : "stories_text_files2",
    KeySchema: [
        { AttributeName: "id", KeyType: "HASH"}
    ],
    AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "N" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
    }
};
dynamodb.createTable(params_ddb_texts, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});
};

var getText = function(fileName) {
var dynamodb = new AWS.DynamoDB();
 var params_text= {
    TableName: 'stories_text_files2',
    Key: {
        'id': {N:stringToInt(fileName)}
    },
    }

dynamodb.getItem(params_text, function(err, data) {
    if (err) {
        console.log("error put item",err);
     } else {
         console.log("Success",data);

        var text = JSON.stringify(data, null, 2);
         console.log("text from getText", text);
         return text;
     }
});
};


var createNewAudio = function(text,fileName) {
var completeFileName = fileName + '.mp3';
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'eu-west-1'
});
//var text = "This is a sample text,blablablabalbla and some more text";
//var fileName = "speech4.mp3";
let params_polly = {
    'Text':text,
    'OutputFormat': 'mp3',
    'VoiceId': 'Justin'
};
Polly.synthesizeSpeech(params_polly, function(err, data) {
    console.log("in syntch");
    if (err) {
        console.log("error in audio creation", err.code)
    } else if (data) {
        if (data.AudioStream instanceof Buffer) {
            Fs.writeFile("./"+completeFileName, data.AudioStream, function(err) {
                if (err) {
                    return console.log(err);
                }
               console.log("The file was saved!")
                uploadAudioFile(fileName);
            })
        }
    }
});
};
var uploadAudioFile = function(fileName) {
var completeFileName = fileName + '.mp3';
var bucketName = 'hanselandyou';
var keyName = completeFileName;
var audio_in = Fs.createReadStream('./'+completeFileName);
var s3= new AWS.S3({ params : {Bucket: bucketName, Key: keyName, ACL:'public-read'}});
s3.putObject({ Body: audio_in}, function(err, data) {
    if (err)
      console.log("bucket put error" , err)
    else
      console.log("Successfully uploaded data to " + bucketName + "/" + keyName);
});

var params_audio = {
    TableName: 'stories_audio_files2',
    Item: {
        'id':{N:stringToInt(fileName)},
        'audio': {S: 'https://s3-eu-west-1.amazonaws.com/hanselandyou/'+completeFileName},
        'keyToFile' : {S: fileName}
    },
    }
var dynamodb = new AWS.DynamoDB();

dynamodb.putItem(params_audio, function(err, data) {
    if (err) {
        console.log("error put item",err);
     } else {
        console.log("Success",data);
     }
});

};
var putText = function(text, fileName) {
var params_put_text= {
    TableName: 'stories_text_files2',
    Item: {
        'id': {N:stringToInt(fileName)} ,
        'text': {S: text},
        'keyToFile' : {S: fileName}
    }
    };
var dynamodb = new AWS.DynamoDB();

dynamodb.putItem(params_put_text, function(err, data) {
    if (err) {
        console.log("error put item",err);
     } else {
        console.log("Success",data);
     }
});
};


exports.manageDB = function(text, fileName) {
createAudioFilesTable();
createTextDB();
createNewAudio(textToPut,fileName);//calls uploadAudioFile after completion
};



