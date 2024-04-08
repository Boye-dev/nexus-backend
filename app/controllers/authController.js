module.exports.logout_get = async (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).json({ success: true, message: "Logout Successful" });
};
