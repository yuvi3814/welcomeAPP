require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const onboard = require('./onboard');
const signature = require('./verifySignature');
const mail = require('./mail');
const nodemailer = require('nodemailer');
const app = express();

 
/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */


const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

app.get('/', (req, res) => {
  res.send('<h2>The Welcome/Terms of Service app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your' +
  ' environment variables.</p>');
  
});


/*
 * Endpoint to receive events from Slack's Events API.
 * It handles `team_join` event callbacks.
 */
app.post('/events', (req, res) => {

  switch (req.body.type) {
    case 'url_verification': {
      // verify Events API endpoint by returning challenge if present
      res.send({ challenge: req.body.challenge });
      break;
    }
    case 'event_callback': {
      // Verify the signing secret
      if (signature.isVerified(req)) {
        const event = req.body.event;
        console.log(event);
        
        // `team_join` is fired whenever a new user (incl. a bot) joins the team
        if (event.type === 'team_join' && !event.is_bot) {
          const { team_id, id } = event.user;
          onboard.initialMessage(team_id, id);
        }

        res.sendStatus(200);
      } else { res.sendStatus(500); }
      break;
    }
    default: { res.sendStatus(500); }
  }
});


/*
 * Endpoint to receive events from interactive message on Slack. 
 * Verify the signing secret before continuing.
 */
app.post('/interactive', (req, res) => {
  const { token, user, team } = JSON.parse(req.body.payload);
  if (signature.isVerified(req)) {
    // simplest case with only a single button in the application
    // check `callback_id` and `value` if handling multiple buttons
    onboard.accept(user.id, team.id);
    res.send({ text: 'Thank you! The Terms of Service have been accepted.' });
  } else { res.sendStatus(500); }
});




//new code for reminding when report slash command is sent from slack
app.get('/remind', (req, res) => {
  res.send('Reminder sent for users to accept Terms and conditions');
  onboard.remind();
  
});

//code for scehduling remind based on cronscheduler, configured time 2 min
//cron.schedule('*/2 * * * *', () => 
//{
//console.log('running every 2 minute');
//onboard.remind1();
//});



// code to verify user and execute slash commands.
app.post('/email', (req, res) => {
  console.log("body..................................................", req.body);
 
  if (req.body.user_id === 'useridhere') {
    mail.sendmail();
    res.send({ text: 'Thank you for the report request, the report has been sent to the Email configured' });
  } else { 
    res.send({ text: 'Your user id does not have access to avail this fucntion, please contact your Slack admin to enable this feature' });
    res.sendStatus(500); }
});








const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
