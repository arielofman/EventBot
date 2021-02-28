require('dotenv').config()

const Discord = require('discord.js');
const client = new Discord.Client();

const fs = require('fs')
const prefix = '!';

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
  const command = require(`./commands/${file}`); 
  client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("!help"); 
}); 

client.on('message', message => {
  if(!message.content.startsWith(prefix) || message.author.bot) return;
 
 
  let args = message.content.slice(prefix.length).trim().split(/("[^"]+")|\ +/g).filter(msg => msg);
  const command = args.shift().toLowerCase();
 
  if (command === 'help') { 
    client.commands.get('help').execute(message, args, client);
  } else if (command === 'event') {
    if (!args.length) {
      return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
    }
    client.commands.get('event').execute(message, args, client, Discord); 
  }
});

client.login(process.env.bot_api_key);
