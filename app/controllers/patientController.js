const Patient = require("../models/Patient");
const PatientVerification = require("../models/PatientVerification");
const { createToken, encryptPassword } = require("../services/authService");
const { translateError } = require("../services/mongo_helper");
const {
  login,
  sendVerificationEmail,
  verifyUser,
  getPatientByEmail,
  sendResetPwdMail,
  resetPassword,
  getPatientById,
} = require("../services/patientService");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { uploadToCloudinary, updatePicture } = require("../services/upload");
const User = require("../models/User");
const { comparePassword } = require("../services/doctorService");

//Signup Route
module.exports.signup_post = async (req, res) => {
  try {
    let filepath = req.file && req.file.path;
    const {
      email,
      password,
      firstName,
      middleName,
      phoneNumber,
      lastName,
      address,
      gender,
      emergencyContactName,
      emergencyContactNumber,
      emergencyContactAddress,
      dateOfBirth,
      relationshipStatus,
      existingMedicalConditions,
      allergies,
    } = req.body;

    if (filepath !== undefined) {
      // To use cloudinary
      let result = await uploadToCloudinary(filepath);

      let profilePicId = result.publicId;
      let profilePic = result.url;

      let patient = new Patient({
        email,
        password: await encryptPassword(password),
        firstName,
        middleName,
        phoneNumber,
        lastName,
        address,
        gender,
        emergencyContactName,
        emergencyContactNumber,
        emergencyContactAddress,
        profilePicture: profilePic,
        profilePicturePublicCloudinaryId: profilePicId,
        dateOfBirth,
        relationshipStatus,
        existingMedicalConditions,
        allergies,
      });
      try {
        await sendVerificationEmail(patient, res);
      } catch (error) {
        return res.status(500).json({
          status: "ERROR",
          message: "Error In Signing Up",
          error: error.message,
        });
      }
    } else {
      return res.status(500).json({
        status: "ERROR",
        message: "Please Select A Profile Image",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Error In Signing Up",
      error: error.message,
    });
  }
};

//Verify Patient Email
module.exports.verify_user = async (req, res) => {
  let { patientId, uniqueString } = req.params;

  try {
    await verifyUser(patientId, uniqueString, res);
  } catch (error) {
    return res.status(404).json({
      status: "ERROR",
      message: "Patient To Verify Not Found",
      error: error.message,
    });
  }
};

//Send Reset Link
module.exports.forgot_password = async (req, res) => {
  let { email } = req.body;
  const check = await getPatientByEmail(email);
  if (check[0] === true) {
    if (!check[1].verified) {
      return res.status(400).json({
        status: "ERROR",
        message: "Email Not Verified",
        error: error.message,
      });
    } else {
      sendResetPwdMail(check[1], res);
    }
  } else {
    return res.status(404).json({
      status: "ERROR",
      message: "Patient Not Found",
      error: error.message,
    });
  }
};

//Reset Password From Link
module.exports.reset_password = async (req, res) => {
  let { patientId, resetString, newPassword } = req.body;

  try {
    await resetPassword(patientId, resetString, newPassword, res);
  } catch (error) {
    return res.status(404).json({
      status: "ERROR",
      message: "Patient To Reset Not Found",
      error: error.message,
    });
  }
};

//Update Password
module.exports.update_password = async (req, res) => {
  let { id } = req.params;
  const { newPassword, oldPassword } = req.body;

  try {
    // Find the patient by ID
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        status: "ERROR",
        message: "Patient Not Found",
      });
    }

    // Check if the old password matches the current password
    const isMatch = await comparePassword(oldPassword, patient.password);

    if (!isMatch) {
      return res.status(400).json({
        status: "ERROR",
        message: "Old password is incorrect",
      });
    }

    // Update the password
    patient.password = await encryptPassword(newPassword);
    const updatedPatient = await patient.save();

    return res.status(200).json({
      status: "OK",
      message: "Password Updated Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};

//Edit Profile
module.exports.edit_profile = async (req, res) => {
  try {
    const { id } = req.params;
    const foundPatient = await getPatientById(id);
    if (foundPatient.success !== false) {
      let filepath = req.file && req.file.path;

      let {
        firstName,
        middleName,
        phoneNumber,
        lastName,
        address,
        gender,
        emergencyContactName,
        emergencyContactNumber,
        emergencyContactAddress,
        dateOfBirth,
        relationshipStatus,
        existingMedicalConditions,
        allergies,
      } = req.body;
      if (filepath !== undefined) {
        let foundPatientPicPublicId =
          foundPatient.data.profilePicturePublicCloudinaryId !== undefined
            ? foundPatient.data.profilePicturePublicCloudinaryId
            : "null";

        let result = await updatePicture(foundPatientPicPublicId, filepath);
        let profilePicId = result.publicId;
        let profilePic = result.url;

        const patient = await Patient.findByIdAndUpdate(
          id,
          {
            firstName,
            middleName,
            phoneNumber,
            lastName,
            address,
            gender,
            emergencyContactName,
            emergencyContactNumber,
            emergencyContactAddress,
            profilePicture: profilePic,
            profilePicturePublicCloudinaryId: profilePicId,
            dateOfBirth,
            relationshipStatus,
            existingMedicalConditions,
            allergies,
          },
          {
            new: true,
          }
        );
        if (patient !== null) {
          return res.status(200).json({
            status: "OK",
            message: "Patient Updated Successfully",
            data: patient,
          });
        } else {
          return res.status(404).json({
            status: "ERROR",
            message: "Patient Not Found",
            error: error.message,
          });
        }
      } else {
        const patient = await Patient.findByIdAndUpdate(
          id,
          {
            firstName,
            middleName,
            phoneNumber,
            lastName,
            address,
            gender,
            emergencyContactName,
            emergencyContactNumber,
            emergencyContactAddress,
            dateOfBirth,
            relationshipStatus,
            existingMedicalConditions,
            allergies,
          },
          {
            new: true,
          }
        );
        if (patient !== null) {
          return res.status(200).json({
            status: "OK",
            message: "Patient Updated Successfully",
            data: patient,
          });
        } else {
          return res.status(404).json({
            status: "ERROR",
            message: "Patient Not Found",
            error: error.message,
          });
        }
      }
    } else {
      return res.status(404).json({
        status: "ERROR",
        message: "Patient Not Found",
        error: error.message,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "ERROR",
      message: "Something Went Wrong",
      error: error.message,
    });
  }
};
module.exports.login_post = async (req, res) => {
  try {
    await login(req, res);
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: translateError(error),
    });
  }
};
module.exports.get_patient = async (req, res) => {
  try {
    const patient = await getPatientById(req.params.id);
    if (patient.success !== false) {
      res.status(200).json({
        status: "OK",
        message: "Patient Found",
        data: patient.data,
      });
    } else {
      res.status(500).json({
        status: "ERROR",
        message: "Patient Not Found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: "Something Went wrong",
      error: error.message,
    });
  }
};
