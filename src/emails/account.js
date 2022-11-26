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
  const stringDate = taskDeadLine.split("-");
  const numberDate = stringDate.map(Number);
  const date = new Date(numberDate[2], numberDate[1] - 1, numberDate[0]);
  const dayOfWeek = date.getDay();
  //first and second paramters are mins and hours respectively
  const scheduled = String(
    `00 00 ${numberDate[0]} ${numberDate[1]} ${dayOfWeek}`
  );
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
