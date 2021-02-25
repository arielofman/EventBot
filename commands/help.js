module.exports = {
    name: 'help',
    description: "explains how to use bot",
    execute(message, args, client) {
        message.channel.send({embed: {
            color: 16258228,
            title: `Example Commands`,
            fields: [
              {
                name: `!event "some description" 5h`,
                value: `Plans an event with some description that will start in 5 hours`
              }, 
              {
                name: `!event "some description" 15m`,
                value: `Plans an event with some description that will start in 15 minutes`
              }, 
              {
                name: `!event "some description" "5:30 pm"`,
                value: `Plans an event with some description that will start today at 5:30pm`
              }, 
              {
                name: `!event "some test" "02-25-2021 5:36 pm"`,
                value: `Plans an event with some description on February 25th, 2021 at 5:36pm`
              }, 
            ],
            timestamp: new Date(),
            footer: {
              icon_url: client.user.avatarURL,
            }
          }
        });
    }
}