const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const handleErrors = (err) => {
  console.log(err.message, err.code);

  let errors = { email: "", password: "" };
  //duplicate error code
  if (err.code === 11000) {
    errors.email = "Email Already Taken";
    return errors;
  }
  //validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(13);
  return await bcrypt.hash(password, salt);
};

module.exports = { handleErrors, createToken, encryptPassword };
