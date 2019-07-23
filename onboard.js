const qs = require('querystring');
const axios = require('axios');
const JsonDB = require('node-json-db');

const db = new JsonDB('users', true, false);

const apiUrl = 'https://slack.com/api';


const postResult = result => console.log(result.data);

// default message - edit to include actual ToS
const message = {
  token: process.env.SLACK_ACCESS_TOKEN,
  link_names: true,
  text: 'Welcome to the team! We\'re glad you\'re here.',
  as_user: true,
  attachments: JSON.stringify([
    {
      title: 'What is Slack?',
      text: 'Slack is where work happens. If this is your first time using Slack, take some time to read the help docs at get.slack.help and our internal wiki. If you have any questions, jump into #help-slack and we\'ll help you out',
      color: '#74c8ed',
    },
    {
      title: 'Code of Conduct',
      text: 'Our goal is to maintain a safe, helpful and friendly community for everyone, regardless of experience, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, nationality, or other defining characteristic. Please take the time to read through <https://code.localhost|Code of Conduct> before continuing.',
      callback_id: 'terms-of-service',
      color: '#3060f0',
      actions: [{
        name: 'accept',
        text: 'Accept',
        type: 'button',
        value: 'accept',
        style: 'primary',
      }],
    }]
  ),
};



//new code for updating toc -YK
function callnewmsg(text,channel) {
  message01.text = text;
  message01.channel = channel;
    axios.post(`${apiUrl}/chat.postMessage`, qs.stringify(message01))
      .then((result => {
        console.log(result.data);
    }))
  };

const message01 = {
  token: process.env.SLACK_ACCESS_TOKEN,
  link_names: true,
  as_user: true,

};

//end of updated TOC code - YK


const initialMessage = (teamId, userId) => {
  let data = false;
  // try fetch team/user pair. This will throw an error if nothing exists in the db
  try { data = db.getData(`/${teamId}/${userId}`); } catch (error) {
    console.error(error);
  }

  // `data` will be false if nothing is found or the user hasn't accepted the ToS
  if (!data) {
    // add or update the team/user record
    //updated code for timestamp
    var sentdate = new Date();
    db.push(`/${teamId}/${userId}/${sentdate}`, false);
    console.log(sentdate);

    // send the default message as a DM to the user
    message.channel = userId;
    axios.post(`${apiUrl}/chat.postMessage`, qs.stringify(message))
      .then((result => {
        console.log(result.data);
      }));
  } else {
    console.log('Already onboarded');
  }
};

// set the team/user record to true to indicate that they've accepted the ToS
// you might want to store the date/time that the terms were accepted
//updated code for timestamp
const accept = (userId, teamId) => {
  var accepteddate = new Date();
  db.push(`/${teamId}/${userId}/${accepteddate}`, true);
console.log(accepteddate);
}



// find all the users who've been presented the ToS and send them a reminder to accept.
// the same logic can be applied to find users that need to be removed from the team
const remind = () => {
  try {
    const data = db.getData('/report');
    Object.keys(data).forEach((team) => {
      Object.keys(data[team]).forEach((user) => {
        if (!data[team][user]) {
          message.channel = user;
          message.text = 'REMINDER from Slack Admin';

          axios.post(`${apiUrl}/chat.postMessage`, qs.stringify(message))
          .then((result => {
            console.log(result.data);
          }));
        }
      });
    });
  } catch (error) { console.error(error); }
};

module.exports = { initialMessage, accept, remind };


const remind1 = () => {
  try {
    const data = db.getData('/');
    Object.keys(data).forEach((team) => {
      Object.keys(data[team]).forEach((user) => {
        if (!data[team][user]) {
          message.channel = user;
          message.text = 'REMINDER from scheduler';

          axios.post(`${apiUrl}/chat.postMessage`, qs.stringify(message))
          .then((result => {
            console.log(result.data);
          }));
        }
      });
    });
  } catch (error) { console.error(error); }
};

module.exports = { initialMessage, accept, remind1, callnewmsg };
