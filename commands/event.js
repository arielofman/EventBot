const moment = require('moment');

module.exports = {
    name: 'event',
    description: "starts an event",
    execute(message, args, client, Discord) { 
        let hours = 0;
        let minutes = 0; 

        // the time and date of the event
        let today = new Date();
        let eventDate = new moment();

        // remove quotations
        args[1] = args[1].replace(/['"]+/g, '') 

        if(moment(args[1], "MM-DD-YYYY h:mm a", true).isValid()) {
            eventDate = moment(args[1]); 
        } else if(args[1].includes("am") || args[1].includes("pm")) {
            let newDate = new Date(today.toDateString() +', ' + args[1]);  
            eventDate = moment(newDate);   
        } else if(args[1].substring(args[1].length - 1, args[1].length) === 'h') {
            hours = args[1].split('h')[0]  
            eventDate = moment().add(hours, 'hours')  
        } else if(args[1].substring(args[1].length - 1, args[1].length) === 'm') {
            minutes = args[1].split('m')[0]
            eventDate = moment().add(minutes, 'minutes')  
        } else {
            return message.reply("You have entered an incorrect date format! :watch:");
        }

        let eventStartTime = eventDate.diff(moment());

        if(eventStartTime <= 0) {
            return message.reply("You selected a past time and date.\nPlease try again.");
        }

        let listEmbedID = 0;
        let eventMsgID = 0;

        let accepted = []
        let rejected = []  

        let buildJson = {embed: {
            color: 3447003,
            title: "Event Details:",
            fields: [],
            timestamp: new Date()
        }};

        // delete last messages
        message.delete();
        
        const file = new Discord.MessageAttachment('./spinner.gif');

        message.channel.send({ files: [file], embed: {
            color: 3066993,
            title: `${message.author.username} started an event!`,
            thumbnail: 
            {
              "url": "attachment://spinner.gif"
            },
            fields: [
              {
                name: "Event Type:",
                value: `${args[0].replace(/['"]+/g, '')}`
              },
              {
                name: "Event Time:",
                value: eventDate.format('MMMM Do YYYY, h:mm a'),
              },
              {
                name: "Instructions:",
                value: "React with :white_check_mark: to confirm or :x: to reject event."
              }
            ],
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
            }
          }
        }).then((embedMessage) => {   
            eventMsgID = embedMessage.id;  

            embedMessage.react('✅');
            embedMessage.react('❌'); 

            const filter = (reaction, user) => {
                return ['✅', '❌'].includes(reaction.emoji.name) && embedMessage.author.id !== user.id;
            };

            const collector = embedMessage.createReactionCollector(filter, { dispose: true, time: eventStartTime });
            
            collector.on('remove', (r, user) => {  

                if(r.emoji.name === "✅") {
                    accepted = accepted.filter(item => item !== user.id) 
                } else if(r.emoji.name === "❌") {
                    rejected = rejected.filter(item => item !== user.id) 
                } 
                 
                buildJson = rebuildConfirmed(buildJson, accepted, rejected); 

                message.channel.messages.fetch(listEmbedID)
                .then(fetchedMsg => fetchedMsg.edit(buildJson))
                .catch(console.error);
            });
 
            collector.on('collect', (r, user)  => {      
                
                if(r.emoji.name === "✅") {
                    accepted.push(user.id);   

                    message.channel.messages.fetch(eventMsgID)
                    .then(fetchedMsg => {
                        let reacts = fetchedMsg.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                        
                        for (const reaction of reacts.values()) {
                         
                            if(reaction.emoji.name === "❌") {
                                reaction.users.remove(user.id); 
                            }
                         
                        }
                    }); 

                } else if(r.emoji.name === "❌") {
                    rejected.push(user.id);    

                    message.channel.messages.fetch(eventMsgID)
                    .then(fetchedMsg => {
                        let reacts = fetchedMsg.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
                        
                        for (const reaction of reacts.values()) {
                         
                            if(reaction.emoji.name === "✅") {
                                reaction.users.remove(user.id); 
                            }
                         
                        }
                    }); 
                }  
                
                buildJson = rebuildConfirmed(buildJson, accepted, rejected);

                message.channel.messages.fetch(listEmbedID)
                .then(fetchedMsg => fetchedMsg.edit(buildJson))
                .catch(console.error);
            });

            collector.on('end', collected =>  {
                message.channel.send(`The event has started!`);
                embedID = 0;
                
                // send dm to all accepted
                for(let player of accepted) {
                    client.users.fetch(`${player}`).then((usr) => {
                        usr.send({embed: {
                            color: 16258228,
                            title: `Event Reminder!`,
                            fields: [
                              {
                                name: `Hey ${usr.username}! :wave:`,
                                value: `This is just a reminder that the event **${args[0]}** has started! :partying_face:`
                              }, 
                            ],
                            timestamp: new Date(),
                            footer: {
                              icon_url: client.user.avatarURL,
                            }
                          }
                        }); 
                    });
                }  
            });           
            message.channel.send(buildJson).then((sent) => {
                listEmbedID = sent.id;
            });
        });
  
    },  
}

function rebuildConfirmed(buildJson, accepted, rejected) {
    let confirmedPlayers = "\u200b";
    let rejectedPlayers = "\u200b";

    buildJson.embed.fields = []
 
    for(let player of accepted) {
        confirmedPlayers += (`<@${player}>` + "\n");
    } 
    
    for(let player of rejected) {
        rejectedPlayers += (`<@${player}>` + "\n");
    }  

    buildJson.embed.fields.push({name: `Confirmed :pushpin:`, value: confirmedPlayers, inline: true });
    buildJson.embed.fields.push({name: `\u200b`, value: `\u200b`, inline: true }); 
    buildJson.embed.fields.push({name: `Rejected :x:`, value: rejectedPlayers, inline: true});                    

    return buildJson;
}

