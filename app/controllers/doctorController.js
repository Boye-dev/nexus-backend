const Doctor = require("../models/Doctor");
const DoctorVerification = require("../models/DoctorVerification");
const { createToken, encryptPassword } = require("../services/authService");
const { translateError } = require("../services/mongo_helper");
const {
  login,
  sendVerificationEmail,
  verifyUser,
  getDoctorByEmail,
  sendResetPwdMail,
  resetPassword,
  getDoctorById,
  comparePassword,
} = require("../services/doctorService");
require("dotenv").config();
const bcrypt = require("bcrypt");
const { uploadToCloudinary, updatePicture } = require("../services/upload");

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
      specialty,
    } = req.body;

    if (filepath !== undefined) {
      // To use cloudinary
      let result = await uploadToCloudinary(filepath);

      let profilePicId = result.publicId;
      let profilePic = result.url;

      let doctor = new Doctor({
        email,
        password: await encryptPassword(password),
        email,
        firstName,
        middleName,
        phoneNumber,
        lastName,
        address,
        gender,
        specialty,
        profilePicture: profilePic,
        profilePicturePublicCloudinaryId: profilePicId,
      });
      try {
        await sendVerificationEmail(doctor, res);
      } catch (error) {
        console.log(error);

        return res.status(500).json({
          status: "ERROR",
          message: "Error In Signing Up",
        });
      }
    } else {
      return res.status(500).json({
        status: "ERROR",
        message: "Please Select A Profile Image",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "ERROR",
      message: "Error In Signing Up",
    });
  }
};

//Verify Doctor Email
module.exports.verify_user = async (req, res) => {
  let { doctorId, uniqueString } = req.params;

  try {
    await verifyUser(doctorId, uniqueString, res);
  } catch (error) {
    return res.status(404).json({
      status: "ERROR",
      message: "Doctor To Verify Not Found",
    });
  }
};

//Send Reset Link
module.exports.forgot_password = async (req, res) => {
  let { email } = req.body;
  const check = await getDoctorByEmail(email);
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
      message: "Doctor Not Found",
      error: error.message,
    });
  }
};

//Reset Password From Link
module.exports.reset_password = async (req, res) => {
  let { doctorId, resetString, newPassword } = req.body;

  try {
    await resetPassword(doctorId, resetString, newPassword, res);
  } catch (error) {
    return res.status(400).json({
      status: "ERROR",
      message: "Doctor To Reset Not Found",
      error: error.message,
    });
  }
};

//Update Password
module.exports.update_password = async (req, res) => {
  let { id } = req.params;
  const { newPassword, oldPassword } = req.body;

  try {
    // Find the doctor by ID
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({
        status: "ERROR",
        message: "Doctor Not Found",
      });
    }

    // Check if the old password matches the current password
    const isMatch = await comparePassword(oldPassword, doctor.password);

    if (!isMatch) {
      return res.status(400).json({
        status: "ERROR",
        message: "Old password is incorrect",
      });
    }

    // Update the password
    doctor.password = await encryptPassword(newPassword);
    const updatedDoctor = await doctor.save();

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
    const foundDoctor = await getDoctorById(id);
    if (foundDoctor.success !== false) {
      let filepath = req.file && req.file.path;

      let { firstName, middleName, phoneNumber, lastName, address, gender } =
        req.body;
      if (filepath !== undefined) {
        let foundDoctorPicPublicId =
          foundDoctor.data.profilePicturePublicCloudinaryId !== undefined
            ? foundDoctor.data.profilePicturePublicCloudinaryId
            : "null";

        let result = await updatePicture(foundDoctorPicPublicId, filepath);
        let profilePicId = result.publicId;
        let profilePic = result.url;

        const doctor = await Doctor.findByIdAndUpdate(
          id,
          {
            firstName,
            middleName,
            phoneNumber,
            lastName,
            address,
            gender,
            profilePicture: profilePic,
            profilePicturePublicCloudinaryId: profilePicId,
          },
          {
            new: true,
          }
        );
        if (doctor !== null) {
          return res.status(200).json({
            status: "OK",
            message: "Doctor Updated Successfully",
            data: doctor,
          });
        } else {
          return res.status(404).json({
            status: "ERROR",
            message: "Doctor Not Found",
            error: error.message,
          });
        }
      } else {
        const doctor = await Doctor.findByIdAndUpdate(
          id,
          {
            firstName,
            middleName,
            phoneNumber,
            lastName,
            address,
            gender,
          },
          {
            new: true,
          }
        );
        if (doctor !== null) {
          return res.status(200).json({
            status: "OK",
            message: "Doctor Updated Successfully",
            data: doctor,
          });
        } else {
          return res.status(404).json({
            status: "ERROR",
            message: "Doctor Not Found",
            error: error.message,
          });
        }
      }
    } else {
      return res.status(404).json({
        status: "ERROR",
        message: "Doctor Not Found",
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

module.exports.get_doctor = async (req, res) => {
  try {
    const doctor = await getDoctorById(req.params.id);
    if (doctor.success !== false) {
      res.status(200).json({
        status: "OK",
        message: "Doctor Found",
        data: doctor.data,
      });
    } else {
      res.status(500).json({
        status: "ERROR",
        message: "Doctor Not Found",
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
