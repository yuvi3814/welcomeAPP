
function sendmail() {
   
    console.log(process.cwd());
const nodemailer = require('nodemailer');
    //setp 1
     let transpoter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ykundasi@gmail.com',
                pass: 'kakashi_3814'
            }
    });
    
    
    //step 2

   let mailoptions = {
            from: 'ykundasi@gmail.com',
            to: 'ykundasi@empyra.com',
            subject: 'updated  list from welcome APP',
            text: 'message from ykundasi@gmail.com',
            attachements: [
                {   // file on disk as an attachment
                    filename: 'users.json',
                    path: './/users.json' // stream this file
                },
                
            ]
           
    }; 
    //step 3
    transpoter.sendMail(mailoptions,function(err,date) {
            if (err) {
                console.log('Error occurs', err);
            }
            else {
                console.log('Email sent');
            }  
    }); 
    
    
} 

module.exports.sendmail = sendmail;