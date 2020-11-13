const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');
const { APP_URL } = require('./config')

const transporter = nodemailer.createTransport(mailGun);

const sendMail = (name, email, password, cb) => {
    const mailOptions = {
        sender: name,
        from: 'easycalinfo@gmail.com',
        to: email,
        subject: "You've been invited to an EasyCal Calendar",
        text: `Hi ${name}! You've been invited to an EasyCal calendar! Please go to ${APP_URL} to login in and change your password. 
        Your temporary password is ${password}.`
    };

    transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
            cb(err, null);
        } else {
            cb(null, data);
        }
    });

// Exporting the sendmail
module.exports = sendMail;
}