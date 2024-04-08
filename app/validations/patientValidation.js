//ERROR HANDLING and VALIDATION

const { check, body, validationResult } = require("express-validator");
const { getPatientByEmail } = require("../services/patientService");
const PatientVerification = require("../models/PatientVerification");
const Patient = require("../models/Patient");

const patientSignupValidator = () => {
  return [
    //Check that email isn't taken
    check("email")
      .custom(async (value) => {
        let patientExist = await getPatientByEmail(value);

        if (patientExist[0] !== false) {
          // Email exists in patient collection
          // Check if it's verified in patientverifications
          const verification = await PatientVerification.findOne({ email: value });

          if (verification) {
            // Check if the verification is expired
            const currentTime = Date.now();
            const expiresAt = verification.expiresAt;

            if (expiresAt > currentTime) {
              // Email exists and verification is not expired
              // Calculate the time difference in milliseconds
              const timeDifference = expiresAt - currentTime;

              // Convert milliseconds to minutes
              const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60));
              return Promise.reject(`Email verification is pending. Please check your email. Verification expires in ${timeDifferenceInMinutes}mins`);
            } else {
              // Verification has expired, delete the verification and patient and return success
              await PatientVerification.deleteOne({ email: value });
              await Patient.deleteOne({ email: value });
              return true;
            }
          } else {
            return Promise.reject(`Email is taken! If it belongs to you, please login!`);

          }
        }
        // Email does not exist 
        return true;
      }),

    body("phoneNumber", "Please enter your Phone Number ").trim().notEmpty(),
    body("firstName", "Please enter your First Name ").trim().notEmpty(),
    body("lastName", "Please enter your Last Name ").trim().notEmpty(),
    body("address", "Please enter your Address").trim().notEmpty(),
    body("gender", "Please enter your Gender ").trim().notEmpty(),
    body("emergencyContactName", "Please enter your Emergency Contact Name ")
      .trim()
      .notEmpty(),
    body(
      "emergencyContactNumber",
      "Please enter your Emergency Contact Phone Number "
    )
      .trim()
      .notEmpty(),
    body(
      "emergencyContactAddress",
      "Please enter your Emergency Contact Address "
    )
      .trim()
      .notEmpty(),
    body("relationshipStatus", "Please enter your Relationship Status")
      .trim()
      .notEmpty(),

    //Email validation
    body("email", "Email is required").trim().notEmpty(),
    body("email", "Email must be valid containing @ and a domain (e.g .com)")
      .isEmail()
      .isLength({ min: 10 }),
    //Password validation
    body("password", "Password is required").trim().notEmpty(),
    body("confirmPassword", "Please enter your password again")
      .trim()
      .notEmpty(),
    check("confirmPassword")
      .custom((value, { req }) => {
        const { password } = req.body;
        if (value === password) {
          return true;
        } else {
          return Promise.reject(); //return false or return Promise.reject() would both work since this isn't an async function
        }
      })
      .withMessage("Passwords must be the same"),
    body("password")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
      .withMessage(
        "Password must be atleast 8 characters long and a combination of at least one upper and lower case letter and one number."
      ),
  ];
};

const patientLoginValidator = () => {
  return [
    check("email")
      .custom(async (value) => {
        let patientExist = await getPatientByEmail(value);

        if (!patientExist[0]) {
          return Promise.reject();
        }
      })
      .withMessage("Email not valid, please signup!"),
    //Email validation
    body("email", "Email is required").trim().notEmpty(),
    body("email", "Email must be valid containing @ and a domain (e.g .com)")
      .isEmail()
      .isLength({ min: 10 }),
    //Password validation
    body("password", "Password is required").trim().notEmpty(),
  ];
};
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  // errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  errors.array().map((err) => extractedErrors.push(err.msg));

  return res.status(400).json({
    errors: extractedErrors,
  });
};

module.exports = {
  patientSignupValidator,
  patientLoginValidator,
  validate,
};
