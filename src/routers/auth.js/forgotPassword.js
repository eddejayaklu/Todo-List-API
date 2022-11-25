const User = require("../../models/users");
const { forgotPasswordEmail } = require("../../emails/account");
const crypto = require("crypto");

// @desc forgot password link will be sent to user email
// @route /users/forgotpassword
// @access public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) throw new Error();
    const resetToken = await user.generatePasswordReset();
    const reseturl = `${req.protocol}://${req.get(
      "host"
    )}/users/resetpassword/${resetToken}`;
    console.log(resetToken);
    forgotPasswordEmail(reseturl, user.email, user.name);
    console.log("hello");
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send();
  }
};

// @desc update the new password with resetUrl
// @route /users/resetpassword
// @access public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) throw new Error();
    console.log(req.body.password);
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    console.log(user);
    await user.save();
    console.log(user);
    const token = await user.generateAuthToken();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send();
  }
};
