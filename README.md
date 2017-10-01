# Hansel & You. Stories alive.
This project has evolved at the Inno{Hacks} Hackathon 2017 and was done in a team of 5 people.  

We love books. We're reading them, sharing them and discussing them. Diving totally in a foreign world. But something is missing. Sometimes the stories don't feel as alive as you might wanted it to be.  
With *Hansel & You* we want to change this! We're making the stories you love alive! So dive into it!

## But How?
Easy. You might already know some kind of interactive adventure books or something like that. But in times of tech and digital things everywhere we want to bring this kind of book in the year of 2017 and spice it up with some digital experience.  

To achieve this goal we decided to develop an Amazon Alexa Skill that will enable that kind of experience for you. On the one hand, you can listen to the story just like a regular Audiobook. But on the other hand you are the one who decides how the story will continue. What will happen to the world? What will happen to the characters? You have the power. Because it is your story. 

## The technical part
### The Skill set
The user can interact with objects inside of the story and can perform different actions with these objects. Depending of the story details a user as already uncovered he gets access to additional objects, actions and informationen via a set of attribute.

### The voice of the story (Polly)
The .mp3-files get created from text input via Polly. Polly is called in the db_manager.js. The created file is then uploaded to a bucket in S3 and gets an entry in a DynamoDB where the Alexa Lambda functions can look up the link to the audio files. We enhance the audio output via SSML to make it more engaging.

### Making decisions
In the story descision points arrive and the user gets prompted to give some input via a question at the end of the audio file. Alexa then listens for the next action the user wants to perform. At this stage every intend is available (because intends can't be hierachical organised) to avoid that the user is able to skip steps we use attributes.

### Bringing atmosphere (Phillips Hue)
Via a custom sensor we are able to submit commands to the Hue lights and change colors at important moments in the story.

## Our Sample story
In our short little sample story we will give you a brief introduction and overview in the world of interactive, voice driven stories.  

You're waking up in a room. No idea how you get there or where you actually are. But you know you have to get out of here. This isn't a nice kind of room you would be in for a longer period of time. You observe the environment and explore different corners of the room. Maybe you can find something useful. 

## One step further
We want to provide a frontend which allows users to create and submit stories of their own. With all of the awesome features that we are using: Adding sound effects, enable SSML, background music, cards (both with text and image), setting attributes and Phillips Hue effects.

A first prototype of this frontend has been created but it "only" provides the ability to submit text.
