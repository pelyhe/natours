const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // create a transporter
    // NOTE: GMAIL example
    // const transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: process.env.EMAIL_USERNAME,
    //         pass: process.env.EMAIL_PASSWORD,
    //     },
    // });
    // NOTE: using mailtrap.io for dev, which fakes email sending, but you can see in the inbox
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // define email options
    const mailOptions = {
        from: 'Pelyhe Adam <garlic0716@gmail.com',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    };

    // send email with nodemailer
    return await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
