const jwt = require("jsonwebtoken");
const { getPatientById } = require("../services/patientService");
const { getDoctorById } = require("../services/doctorService");

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization || false;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        res
          .status(401)
          .json({ success: true, message: { error: "Invalid Token" } });
      } else {
        next();
      }
    });
  } else {
    res.status(401).json({
      status: "ERROR",
      message: "No Valid Token Please Login",
    });
  }
};
const isDoctor = (req, res, next) => {
  const token = req.headers.authorization || false;

  if (!token) {
    return res.status(401).json({
      error:
        "Cannot access this route because a token is required for authentication",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    if (req.user.role !== "DOCTOR") {
      return res
        .status(401)
        .json({ error: "Can't access this route, not a  Doctor." });
    } else {
      return next();
    }
  } catch (error) {
    console.log("Invalid Token ", error);
  }
  return next();
};
const isVerified = async (req, res, next) => {
  const token = req.headers.authorization || false;

  if (!token) {
    return res.status(401).json({
      error:
        "Cannot access this route because a token is required for authentication",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (req.user.role === "DOCTOR") {
      const doctor = await getDoctorById(req.user.id);
      console.log(doctor);
      if (doctor.data.verified) {
        return next();
      } else {
        return res.status(401).json({ message: "Please Verify Your Email" });
      }
    }
    if (req.user.role === "PATIENT") {
      console.log("patient");
      const patient = await getPatientById(req.user.id);
      if (patient.data.verified) {
        return next();
      } else {
        return res.status(401).json({ message: "Please Verify Your Email" });
      }
    }
  } catch (error) {
    console.log("Invalid Token ", error);
  }
  return next();
};
module.exports = { requireAuth, isDoctor, isVerified };
