const Patient = require("../models/Patient");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const PatientVerification = require("../models/PatientVerification");
const PatientPasswordReset = require("../models/PatientPasswordReset");
const { createToken } = require("./authService");
const User = require("../models/User");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});
//Get Patient By Email
const getPatientByEmail = async (email) => {
  const patient = await Patient.findOne({ email });

  if (patient !== null) {
    return [true, patient];
  } else {
    return [false, "Patient with that email doesn't exist"];
  }
};

const getPatientById = async (id) => {
  try {
    const patient = await Patient.findById(id);
    if (patient !== null) {
      return { success: true, data: patient };
    } else {
      return {
        success: false,
        message: "Patient doesn't exist. It is null and/or has been deleted.",
      };
    }
  } catch (error) {
    return { success: false, message: translateError(error) };
  }
};

//Login Service
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Incorrect Email" });
    }

    const auth = await bcrypt.compare(password, patient.password);
    if (!auth) {
      return res
        .status(400)
        .json({ status: "ERROR", message: "Incorrect Password" });
    }

    const { password: omitPassword, ...patientData } = patient.toObject();
    const token = createToken(patient._id, patient.role);
    const maxAge = 3 * 24 * 60 * 60;
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: maxAge * 1000,
    });

    res.status(200).json({
      status: "OK",
      message: "Login Successfull",
      data: patientData,
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ status: "ERROR", message: "Login failed", error: error.message });
  }
};

//send verification mail
const sendVerificationEmail = async (patient, res) => {
  const { _id, email } = patient;
  const uniqueString = uuidv4() + _id;
  let url = `https://nexus-frontend-rho.vercel.app/verify-patient/${_id}/${uniqueString}`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Email",
    html: `
   <html>
   <head>
   <style>
   @import url('https://fonts.googleapis.com/css2?family=Poppins:ital@1&display=swap');
   body{
     font-family: 'Poppins', sans-serif;
   }
 </style>
   </head>
    <body style="background-color:  rgb(250, 221, 211);">
        <table style="width: 100%; max-width: 600px; margin: 0 auto;">
            <tr style="height: 400px;">
                <td colspan="2" style="background-color: #FFFFFF; padding: 20px; text-align: center; background-repeat: no-repeat; background-size: contain;">
                    
                    <p style="line-height: 1.7em; margin-top: 10px; font-weight: bolder;">JUST ONE MORE STEP............</p>
                    <p style="line-height: 1.7em; margin-top: 20px;">In order to start using your NEXUS account, you need to confirm<br>your email address</p>
                    <p style="text-align: center; margin-top: 10px;">
                       <a href=${url}> <button style="background-color: #DF4B30; border: 1px solid #DF4B30; width: 230px; height: 35px; border-radius: 20px; font-size: 15px; color: #FFFFFF;">Verify Email Adress</button></a>
                    </p>
                    <p style="margin-top: 5px; font-weight: bolder;">___________________________________</p>
                    <p style="margin-top: 5px; line-height: 1.7em; text-align: center; font-size: 12px; color: grey;">If you did not sign up for this account, you can ignore this email and the<br>account will be deleted</p>
                </td>
            </tr>
            <tr>
                <td colspan="2" style="text-align: center; padding: 20px;">
                    <img src="cid:facebook" alt="Facebook Icon" style="max-width: 30px; margin-right: 10px;">
                    <img src="cid:instagram" alt="Instagram Icon" style="max-width: 30px; margin-right: 10px;">
                    <img src="cid:twitter" alt="Twitter Icon" style="max-width: 30px;">
                    <p style="color: grey; margin-top: 10px;">© 2023 Nexus. All rights reserved.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
      `,
    attachments: [
      // {
      //   filename: "nlogo.png",
      //   path: "images/nlogo.png",
      //   cid: "nlogo",
      // },
      // {
      //   filename: "design.png",
      //   path: "images/design.png",
      //   cid: "design",
      // },
      {
        filename: "facebook.png",
        path: "images/facebook.png",
        cid: "facebook",
      },
      {
        filename: "instagram.png",
        path: "images/instagram.png",
        cid: "instagram",
      },
      {
        filename: "twitter.png",
        path: "images/twitter.png",
        cid: "twitter",
      },
    ],
  };

  const saltBounds = 10;
  bcrypt
    .hash(uniqueString, saltBounds)
    .then((hashedUniqueString) => {
      const newVerification = new PatientVerification({
        patientId: _id,
        email: email,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });

      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              patient
                .save()
                .then(() => {
                  res.status(201).json({
                    status: "OK",
                    message:
                      "Verification Message Sent Successfully Please Check Your Email And Login",
                  });
                })
                .catch((error) => {
                  console.log(error);
                  return res.status(500).json({
                    status: "ERROR",
                    message: "Error In Signing Up",
                    error: error.message,
                  });
                });
            })
            .catch((error) => {
              console.log(error);
              return res.status(500).json({
                status: "ERROR",
                message: "Error In Sending Verification Email",
                error: error.message,
              });
            });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({
            status: "ERROR",
            message: "Error In Creating Verification Email",
            error: error.message,
          });
        });
    })
    .catch((error) => {
      return res.status(500).json({
        status: "ERROR",
        message: "Error In Creating Verification Email",
        error: error.message,
      });
    });
};

const verifyUser = async (patientId, uniqueString, res) => {
  try {
    let patient = await PatientVerification.find({ patientId });

    if (patient.length > 0) {
      const { expiresAt } = patient[0];
      const hashedUniqueString = patient[0].uniqueString;
      if (expiresAt < Date.now()) {
        PatientVerification.deleteOne({ patientId })
          .then((result) => {
            Patient.deleteOne({ _id: patientId })
              .then(() => {
                return res.status(200).json({
                  staus: "OK",
                  message: "Link Has Expired Please Sign Up",
                });
              })
              .catch((error) => {
                return res.status(500).json({
                  staus: "ERROR",
                  message: "Could Not Delete Patient From Record",
                  error: error.message,
                });
              });
          })
          .catch((error) => {
            return res.status(500).json({
              staus: "ERROR",
              message: "Could Not Delete Patient From Record",
              error: error.message,
            });
          });
      } else {
        bcrypt
          .compare(uniqueString, hashedUniqueString)
          .then((result) => {
            if (result) {
              Patient.updateOne({ _id: patientId }, { verified: true })
                .then(() => {
                  const newUser = new User({
                    userId: patientId,
                    role: "Patient",
                  });

                  newUser
                    .save()
                    .then(
                      PatientVerification.deleteOne({ patientId })
                        .then(() => {
                          return res.status(200).json({
                            staus: "OK",
                            message:
                              "Patient Verified successfully Please Login",
                          });
                        })
                        .catch((error) => {
                          return res.status(500).json({
                            status: "ERROR",
                            message: "Error Verifying Patient ",
                            error: error.message,
                          });
                        })
                    )
                    .catch((error) => {
                      return res.status(500).json({
                        status: "ERROR",
                        message: "Error Occured while checking new user",
                        error: error.message,
                      });
                    });
                })
                .catch((error) => {
                  return res.status(500).json({
                    status: "ERROR",
                    message:
                      "Error Occured while checking for existing patient record ",
                    error: error.message,
                  });
                });
            } else {
              return res.status(500).json({
                status: "ERROR",
                message:
                  "Error Occured while checking for existing patient record ",
                error: error.message,
              });
            }
          })
          .catch((error) => {
            return res.status(500).json({
              status: "ERROR",
              message:
                "Error Occured while checking for existing patient record ",
              error: error.message,
            });
          });
      }
    } else {
      return res.status(404).json({
        status: "ERROR",
        message: "Patient To Verify Not Found",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Error Verifying Email",
      error: error.message,
    });
  }
};

//send reset password
const sendResetPwdMail = async (patient, res) => {
  const { _id, email, firstName } = patient;
  const resetString = uuidv4() + _id;
  PatientPasswordReset.deleteMany({ patientId: _id })
    .then((result) => {
      let url = `https://nexus-frontend-rho.vercel.app/resetPassword/patient/${_id}/${resetString}`;

      let mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        attachments: [
          {
            filename: "twitter.png",

            path: "images/twitter.png",
            cid: "twitter",
          },
          {
            filename: "facebook.png",
            path: "images/facebook.png",

            cid: "facebook",
          },
          {
            filename: "instagram.png",
            path: "images/instagram.png",

            cid: "instagram",
          },
          {
            filename: "nexuslogoalone.png",
            path: "images/nexuslogoalone.png",

            cid: "nexuslogoalone",
          },
          {
            filename: "Login.png",
            path: "images/Login.png",

            cid: "Login",
          },
          {
            filename: "Group.png",
            path: "images/Group.png",

            cid: "Group",
          },
          {
            filename: "Rectangle-143.png",
            path: "images/Rectangle-143.png",

            cid: "Rectangle-143",
          },
        ],
        subject: "Reset Your Password",
        html: `
        <html>
        <head>
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital@1&display=swap');
        body{
          font-family: 'Poppins', sans-serif;
        }
      </style>
        </head>
        <body style="background-color: bisque; font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;">
        <table style="width: 100%; height: 100vh">
          <tr>
            <td style="display: flex; justify-content: center; align-items: center">
              <table
                style="
                  width: 100%;
                  max-width: 600px;
                  margin: 0 auto;
                  margin-top: 10%;
                  background-color: white;
                "
              >
                <tr>
                  <td style="text-align: center; padding-top: 20px">
                    <img
                      src="cid:nexuslogoalone"
                      alt="nexus-header-logo"
                      style="max-width: 100%; margin-bottom: 20px"
                    />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 20px">
                    <table
                      style="
                        width: 100%;
                        background-image: url(cid:Rectangle-143.png);
                        background-repeat: no-repeat;
                        background-size: cover;
                      "
                    >
                      <tr>
                        <td style="text-align: center; padding-top: 30px">
                          <img
                            src="cid:Login"
                            alt="login-icon"
                            id="login-icon"
                            style="max-width: 100%; margin-right: 30px"
                          />
                          <img
                            src="cid:Group"
                            alt="group-icon"
                            style="max-width: 100%"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; padding: 20px 0">
                          <h1 style="color: #F57679; margin-bottom: 10px">
                            Forgot your password?
                          </h1>
                          <p>We received a request to reset your password.</p>
                          <p>
                            If you didn't make this request, simply ignore this
                            email.
                          </p>
                          <div style="text-align: center; margin-top: 25px">
                            <p style="font-size: small">
                              If you did make this request just click the button
                              below:
                            </p>
                            <a href=${url}><button
                              style="
                                background-color: #F57679;
                                border: none;
                                padding: 0 20px;
                                color: white;
                                height: 40px;
                                border-radius: 20px;
                              "
                            >
                              RESET MY PASSWORD
                            </button></a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="text-align: center; padding-top: 30px">
                    <img
                      src="cid:facebook"
                      alt="facebook-icon"
                      style="max-width: 24px; margin-left: 10px"
                    />
                    <img
                      src="cid:instagram"
                      alt="instagram-icon"
                      style="max-width: 24px; margin-left: 10px"
                    />
                    <img
                      src="cid:twitter"
                      alt="twitter-icon"
                      style="max-width: 24px; margin-left: 10px"
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      text-align: center;
                      padding-top: 20px;
                      padding-bottom: 20px;
                    "
                  >
                    <p>&copy; 2023 Nexus. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
        `,
      };

      const saltBounds = 10;
      bcrypt
        .hash(resetString, saltBounds)
        .then((hashedResetString) => {
          const newReset = new PatientPasswordReset({
            patientId: _id,
            resetString: hashedResetString,
            email: email,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
          });

          newReset
            .save()
            .then(() => {
              transporter
                .sendMail(mailOptions)
                .then(() => {
                  return res.status(201).json({
                    status: "OK",
                    message: "Reset Link Sent Successfully",
                  });
                })
                .catch((error) => {
                  console.log(error);
                  return res.status(500).json({
                    status: "ERROR",
                    message: "Error In Sending Reset Link",
                    error: error.message,
                  });
                });
            })
            .catch((error) => {
              console.log(error);
              return res.status(500).json({
                status: "ERROR",
                message: "Error In Sending Reset Link",
                error: error.message,
              });
            });
        })
        .catch((error) => {
          return res.status(500).json({
            status: "ERROR",
            message: "Error In Sending Reset Link",
            error: error.message,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        status: "ERROR",
        message: "Error Deleting Records",
        error: error.message,
      });
    });
};
const resetPassword = async (patientId, resetString, newPassword, res) => {
  try {
    let patient = await PatientPasswordReset.find({ patientId });

    if (patient.length > 0) {
      const { expiresAt } = patient[0];
      const hashedResetString = patient[0].resetString;
      if (expiresAt < Date.now()) {
        PatientPasswordReset.deleteOne({ patientId })
          .then((result) => {
            return res.status(200).json({
              staus: "OK",
              message: "Link Has Expired Please Try Again",
            });
          })
          .catch((error) => {
            return res.status(500).json({
              staus: "ERROR",
              message: "Could Not Delete Patient From Record",
              error: error.message,
            });
          });
      } else {
        bcrypt
          .compare(resetString, hashedResetString)
          .then((result) => {
            if (result) {
              const saltBounds = 10;
              bcrypt
                .hash(newPassword, saltBounds)
                .then((hashedNewPassword) => {
                  Patient.updateOne(
                    { _id: patientId },
                    { password: hashedNewPassword }
                  )
                    .then(() => {
                      PatientPasswordReset.deleteOne({ patientId })
                        .then(() => {
                          return res.status(200).json({
                            staus: "OK",
                            message: "Patient Password Reset successfull",
                          });
                        })
                        .catch((error) => {
                          return res.status(500).json({
                            status: "ERROR",
                            message: "Updating Patient Password Failed",
                            error: error.message,
                          });
                        });
                    })
                    .catch((error) => {
                      return res.status(500).json({
                        status: "ERROR",
                        message:
                          "Error Occured while checking for existing patient record ",
                        error: error.message,
                      });
                    });
                })
                .catch(() => {
                  return res.status(500).json({
                    status: "ERROR",
                    message: "An error occured while hashing password",
                    error: error.message,
                  });
                });
            } else {
              return res.status(500).json({
                status: "ERROR",
                message:
                  "Error Occured while checking for existing patient record ",
                error: error.message,
              });
            }
          })
          .catch((error) => {
            return res.status(500).json({
              status: "ERROR",
              message:
                "Please check for a newer reset link",
              error: error.message,
            });
          });
      }
    } else {
      return res.status(404).json({
        status: "ERROR",
        message: "Patient To Reset Not Found",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Error Resetting Password",
      error: error.message,
    });
  }
};

module.exports = {
  getPatientByEmail,
  login,
  sendVerificationEmail,
  verifyUser,
  sendResetPwdMail,
  resetPassword,
  getPatientById,
};
