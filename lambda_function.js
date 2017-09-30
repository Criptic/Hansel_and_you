var speechOutput;
var reprompt;
var welcomeOutput = "Welcome to Hansel and you. Say start to start.";
var welcomeReprompt = "sample re-prompt text";

"use strict";
var Alexa = require('alexa-sdk');
var AWS = require("aws-sdk");
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var speechOutput = '';
var interval;

var http = require("https");

var options = {
  "method": "PUT",
  "hostname": "api.meethue.com",
  "port": null,
  "path": "/v2/bridges/001788fffe200470/nS7IqOD-R8KClDzm3Wq7Oqo-yq2QRpOCXEnRn2d3/groups/2/action",
  "headers": {
    "Authorization": "Bearer mSVWYub0KNB1dSDjDrbjRg8sac2J",
    "Content-Type": "application/json"
  }
};

var handlers = {
    'LaunchRequest': function () {
      this.attributes["door"] = {};
      this.attributes["door"].opened = false;

      this.attributes["carpet"] = {};
      this.attributes["carpet"].keyIsThere = true;

      this.attributes["key"] = {};
      this.attributes["key"].found = false;

      var self = this;

      AWS.config.update({
        region: "eu-west-1",
        endpoint: "dynamodb.eu-west-1.amazonaws.com"
      });

      var docClient = new AWS.DynamoDB.DocumentClient()
      var params = {
          TableName: "stories_audio_files",
          Key:{ "id": 1 }
      };

      docClient.get(params, function(err, data) {
          if (err) {
              console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
              this.emit(':tell', "I couldn't load the story.");
          } else {
              self.attributes['url'] = data.Item.audio;
              speechOutput = '<audio src="'+ data.Item.audio +'" />';
              self.response.speak(speechOutput);
              self.emit(':responseReady')
          }
      });
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
    	speechOutput = "There’s a note under the bed with this sentence written on it: A key is hidden under the carpet.";
      this.emit(":ask", speechOutput, speechOutput);
    },
	"Carpet": function () {
      if(this.attributes["carpet"].keyIsThere){
    	   speechOutput = "There is an old rusty key under the carpet. What do you want to do?";
      }else{
        speechOutput = "There is nothing here anymore.";
      }

      this.emit(":ask", speechOutput, speechOutput);
    },
	"Door": function () {
		var speechOutput = "";
      if(this.attributes["key"].found){
        this.attributes["door"].opened = true;
        speechOutput = "With a sigh of relief you step out of the room you were trapped in and take a deep breath of fresh spring air and enjoy the sunshine.";
        this.emit(":tell", speechOutput, speechOutput);
      }else{
        speechOutput = "The door is closed, you will need a key to open this door."
        this.emit(":ask", speechOutput, speechOutput);
      }
    },
	"Key": function () {
		var speechOutput = "";
    	//any intent slot variables are listed here for convenience
      this.attributes["carpet"].keyIsThere = false;
      this.attributes["key"].found = true;
    	//Your custom intent handling goes here
    	speechOutput = "You take the key.";
        this.emit(":ask", speechOutput, speechOutput);
    },
	"StartIntent": function () {
      var self = this;
      startColorAnimation().then(() => {
        speechOutput = "You wake up in a room. Looking around you see a rugged carpet on the floor, a bed and a closed door. What do you want to do?";
        self.emit(':ask', speechOutput, speechOutput);
      });
    },
	"Unhandled": function () {
      var speechOutput = "The skill didn't quite understand what you wanted. Do you want to try something else?";
      this.emit(':ask', speechOutput, speechOutput);
  }
};

exports.handler = (event, context) => {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

function startColorAnimation(){
  return new Promise(function (fulfill, reject){
    var req = http.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", fulfill);
    });

    req.write('{"scene":"ktD4qe8pAqoL8C-"}');
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
