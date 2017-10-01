var speechOutput;
var reprompt;
var welcomeOutput = "Welcome to Hansel and you. Say start to start.";
var welcomeReprompt = "sample re-prompt text";

"use strict";
var Alexa = require('alexa-sdk');
var AWS = require("aws-sdk");
var http = require("https");

var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var speechOutput = '';

const LAUNCH_ID = 1;
const START_ID = 2;
const BED_ID = 3;
const ERROR_ID = 12;
const DOOR_LITTLE_KEY_ID = 5;
const DOOR_BIG_KEY_ID = 6;
const CARPET_ID = 7;
const NOTE_ID = 8;
const WARDROBE_ID = 9;
const SAFE_WRONG_ID = 10;
const SAFE_RIGHT_ID = 11;

AWS.config.update({
  region: "eu-west-1",
  endpoint: "dynamodb.eu-west-1.amazonaws.com"
});

var handlers = {
    'LaunchRequest': function () {
      this.attributes["carpet"] = {};
      this.attributes["carpet"].noteIsThere = true;

      this.attributes["little_key"] = {};
      this.attributes["little_key"].found = false;

      this.attributes["big_key"] = {};
      this.attributes["big_key"].found = false;

      this.attributes["timeoutcounter"] = 0;

      var self = this;
      playAudioWithId(this, LAUNCH_ID).then(() => {self.emit(':responseReady')});
    },
	'AMAZON.HelpIntent': function () {
        speechOutput = '';
        reprompt = '';
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = '';
        this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function () {
        speechOutput = '';
        this.emit(':tell', speechOutput);
    },
    "AMAZON.PauseIntent": function () {
  		var speechOutput = "";
      this.emit(':tell', speechOutput);
    },
	"AMAZON.ResumeIntent": function () {
    this.emit(':tell', speechOutput);
    },
  'SessionEndedRequest': function () {
      speechOutput = '';
      this.emit(':tell', speechOutput);
  },
	"Bed": function () {
      this.attributes["little_key"].found = true;
      var self = this;
    	playAudioWithId(this, BED_ID).then(() => {self.emit(':responseReady')});
    },
  "Note": function () {
      var self = this;
      if(!this.attributes["carpet"].noteIsThere){
        var cardTitle = 'Riddle on the Note';
        var cardContent = 'Alive without breath,\nAs cold as death;\nNever thirsty, ever drinking,\nAll in mail never clinking.';
        playAudioWithId(this, NOTE_ID).then(() => {this.emit(':askWithCard', speechOutput, cardTitle, cardContent)});
      }else{
      	playAudioWithId(this, ERROR_ID).then(() => {self.emit(':responseReady')});
      }
    },
  "Wardrobe": function () {
      var self = this;
      playAudioWithId(this, WARDROBE_ID).then(() => {self.emit(':responseReady')});
    },
	"Carpet": function () {
      var self = this;
      this.attributes["carpet"].noteIsThere = false;
      playAudioWithId(this, CARPET_ID).then(() => {self.emit(':responseReady')});
    },
	"Door": function () {
      var self = this;
  		if(this.attributes["big_key"].found){
        playAudioWithId(this, DOOR_BIG_KEY_ID).then(() => {endSession(self)});
      }else if(this.attributes["little_key"].found){
        playAudioWithId(this, DOOR_LITTLE_KEY_ID).then(() => {self.emit(':responseReady')});
      }else{
        playAudioWithId(this, ERROR_ID).then(() => {self.emit(':responseReady')});
      }
    },
	"StartIntent": function () {
      this.attributes["carpet"] = {};
      this.attributes["carpet"].noteIsThere = true;

      this.attributes["little_key"] = {};
      this.attributes["little_key"].found = false;

      this.attributes["big_key"] = {};
      this.attributes["big_key"].found = false;

      this.attributes["timeoutcounter"] = 0;

      var self = this;
      setColorAnimation(4, 0)
        .then(() => {setColorAnimation(3, 1)
        .then(()=>{playAudioWithId(self, START_ID)
        .then(() => {self.emit(':responseReady')})})});

    },
  "Safe": function () {
      var self = this;
  		var passwordSlotRaw = this.event.request.intent.slots.password.value;
  		console.log(passwordSlotRaw);
  		var passwordSlot = resolveCanonical(this.event.request.intent.slots.password);
  		console.log(passwordSlot);

    	if(passwordSlot.toLowerCase() == "fish"){
        this.attributes["big_key"].found = true;
        //TODO Hue blink?
        playAudioWithId(this, SAFE_RIGHT_ID).then(() => {self.emit(':responseReady')});
      }else{
        playAudioWithId(this, SAFE_WRONG_ID).then(() => {self.emit(':responseReady')});
      }
    },
	"Unhandled": function () {
      var self = this;
      playAudioWithId(this, ERROR_ID).then(() => {self.emit(':responseReady')});
  }
};

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function playAudioWithId(self, id){
  if(id == 12){
    id = Math.random() * (15 - 12) + 12;
  }

  var closeSession = false;
  self.attributes["timeoutcounter"] = self.attributes["timeoutcounter"] + 1;
  if(self.attributes["timeoutcounter"] > 15){
    id = 4;
    closeSession = true;
  }

  var docClient = new AWS.DynamoDB.DocumentClient();
  var params = {
      TableName: "stories_audio_files",
      Key:{ "id": id }
  };

  return new Promise(function (fulfill, reject){
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            self.emit(':tell', "I couldn't load the story.");
            reject();
        } else {
            if(data){
              self.attributes['url'] = data.Item.audio;
              speechOutput = '<audio src="'+ data.Item.audio +'" />';
              self.response.speak(speechOutput).listen();
            }
            if(closeSession){
              endSession(self);
            }
            fulfill();
        }
    });
  });
}

function endSession(self){
  setColorAnimation(3, 0)
    .then(()=>{setColorAnimation(4, 1)
    .then(()=>{self.response.speak("")})});
}

function setColorAnimation(sensor, state){
  var options = {
    "method": "PUT",
    "hostname": "api.meethue.com",
    "port": null,
    "path": "/v2/bridges/001788fffe200470/nS7IqOD-R8KClDzm3Wq7Oqo-yq2QRpOCXEnRn2d3/sensors/" + sensor,
    "headers": {
      "Authorization": "Bearer mSVWYub0KNB1dSDjDrbjRg8sac2J",
      "Content-Type": "application/json"
    }
  };

  return new Promise(function (fulfill, reject){
    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", fulfill);
    });

    req.write('{"state":{"status":'+state+'}}');
    req.end();
  });
}

function resolveCanonical(slot){
	//this function looks at the entity resolution part of request and returns the slot value if a synonyms is provided
    try{
		var canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
	}catch(err){
	    console.log(err.message);
	    var canonical = slot.value;
	};
	return canonical;
};

function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
	  var updatedIntent= null;
	  // updatedIntent=this.event.request.intent;
      //optionally pre-fill slots: update the intent object with slot values for which
      //you have defaults, then return Dialog.Delegate with this updated intent
      // in the updatedIntent property
      //this.emit(":delegate", updatedIntent); //uncomment this is using ASK SDK 1.0.9 or newer

	  //this code is necessary if using ASK SDK versions prior to 1.0.9
	  if(this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
			shouldEndSession: false
		});
		this.emit(':responseReady', updatedIntent);

    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
      // return a Dialog.Delegate directive with no updatedIntent property.
      //this.emit(":delegate"); //uncomment this is using ASK SDK 1.0.9 or newer

	  //this code necessary is using ASK SDK versions prior to 1.0.9
		if(this.isOverridden()) {
			return;
		}
		this.handler.response = buildSpeechletResponse({
			sessionAttributes: this.attributes,
			directives: getDialogDirectives('Dialog.Delegate', updatedIntent, null),
			shouldEndSession: false
		});
		this.emit(':responseReady');

    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      // Dialog is now complete and all required slots should be filled,
      // so call your normal intent handler.
      return this.event.request.intent;
    }
}


function randomPhrase(array) {
    // the argument is an array [] of words or phrases
    var i = 0;
    i = Math.floor(Math.random() * array.length);
    return(array[i]);
}
function isSlotValid(request, slotName){
        var slot = request.intent.slots[slotName];
        //console.log("request = "+JSON.stringify(request)); //uncomment if you want to see the request
        var slotValue;

        //if we have a slot, get the text and store it into speechOutput
        if (slot && slot.value) {
            //we have a value in the slot
            slotValue = slot.value.toLowerCase();
            return slotValue;
        } else {
            //we didn't get a value in the slot.
            return false;
        }
}

//These functions are here to allow dialog directives to work with SDK versions prior to 1.0.9
//will be removed once Lambda templates are updated with the latest SDK

function createSpeechObject(optionsParam) {
    if (optionsParam && optionsParam.type === 'SSML') {
        return {
            type: optionsParam.type,
            ssml: optionsParam['speech']
        };
    } else {
        return {
            type: optionsParam.type || 'PlainText',
            text: optionsParam['speech'] || optionsParam
        };
    }
}

function buildSpeechletResponse(options) {
    var alexaResponse = {
        shouldEndSession: options.shouldEndSession
    };

    if (options.output) {
        alexaResponse.outputSpeech = createSpeechObject(options.output);
    }

    if (options.reprompt) {
        alexaResponse.reprompt = {
            outputSpeech: createSpeechObject(options.reprompt)
        };
    }

    if (options.directives) {
        alexaResponse.directives = options.directives;
    }

    if (options.cardTitle && options.cardContent) {
        alexaResponse.card = {
            type: 'Simple',
            title: options.cardTitle,
            content: options.cardContent
        };

        if(options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
            alexaResponse.card.type = 'Standard';
            alexaResponse.card['image'] = {};

            delete alexaResponse.card.content;
            alexaResponse.card.text = options.cardContent;

            if(options.cardImage.smallImageUrl) {
                alexaResponse.card.image['smallImageUrl'] = options.cardImage.smallImageUrl;
            }

            if(options.cardImage.largeImageUrl) {
                alexaResponse.card.image['largeImageUrl'] = options.cardImage.largeImageUrl;
            }
        }
    } else if (options.cardType === 'LinkAccount') {
        alexaResponse.card = {
            type: 'LinkAccount'
        };
    } else if (options.cardType === 'AskForPermissionsConsent') {
        alexaResponse.card = {
            type: 'AskForPermissionsConsent',
            permissions: options.permissions
        };
    }

    var returnResult = {
        version: '1.0',
        response: alexaResponse
    };

    if (options.sessionAttributes) {
        returnResult.sessionAttributes = options.sessionAttributes;
    }
    return returnResult;
}

function getDialogDirectives(dialogType, updatedIntent, slotName) {
    let directive = {
        type: dialogType
    };

    if (dialogType === 'Dialog.ElicitSlot') {
        directive.slotToElicit = slotName;
    } else if (dialogType === 'Dialog.ConfirmSlot') {
        directive.slotToConfirm = slotName;
    }

    if (updatedIntent) {
        directive.updatedIntent = updatedIntent;
    }
    return [directive];
}
