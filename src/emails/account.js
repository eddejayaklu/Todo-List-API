const nodemailer = require("nodemailer");
const cron = require("node-cron");

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendWelcomeEmail = (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: String(email),
    subject: "Thanks for joining in!",
    text: `Hi ${name} if you do have any queries please do reach out to us!`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const forgotPasswordEmail = (resetUrl, email, name) => {
  console.log(name, "hello");
  const mailOptions = {
    from: process.env.EMAIL,
    to: String(email),
    subject: "ResetPassword",
    text: `Hi ${name}, You have recieved this mail because you have requsted to reset the password. \n\n Please click on the below link to rest the password.\n\n ${resetUrl}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const sendCancelationEmail = (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: String(email),
    subject: "Sorry to see you go!",
    text: `Please mail us ${name} what let you go, so that we can improve`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const remainderEmail = (email, taskDescription, userName, taskDeadLine) => {
  const day = taskDeadLine.getDate();
  const month = taskDeadLine.getMonth() + 1;
  const dayOfWeek = taskDeadLine.getDay();
  //first and second paramters are mins and hours respectively
  const scheduled = String(`00 00 ${day} ${month} ${dayOfWeek}`);
  cron.schedule(
    scheduled,
    () => {
      const mailOptions = {
        from: process.env.EMAIL,
        to: String(email),
        subject: `Reaminder for ${taskDescription}`,
        text: `Hi ${userName} This is a Reaminder for your ${taskDescription}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
  remainderEmail,
  forgotPasswordEmail,
};
