const { getDoctorById } = require("./doctorService");
const { getPatientById } = require("./patientService");
const nodemailer = require("nodemailer");

require("dotenv").config();
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

const sendBookEmail = async (patientId, doctorId, savedAppointment, res) => {
  const patient = await getPatientById(patientId);
  const doctor = await getDoctorById(doctorId);
  let urlD = `https://boye-dev-nexus.vercel.app/doctor/waitlist`;
  let urlP = `https://boye-dev-nexus.vercel.app/patient/dashboard`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: patient.data.email,
    subject: "Appointment Booked",
    attachments: [
      {
        filename: "approved.png",
        path: "images/approved.png",

        cid: "approved",
      },
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
    ],
    html: `<html lang="en">
    <head>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital@1&display=swap');
    body{
      font-family: 'Poppins', sans-serif;
    }
  </style>
    </head>
    <body style="background-color: bisque;">
      <table
        style="
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: bisque;
          font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
            'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        "
      >
        <tr>
          <td colspan="2" style="text-align: center; padding: 20px 0">
            <img src="cid:nexuslogoalone" style="max-width: 100%"  alt="Nexus Logo"/>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <p>
              Hi, <b>${patient.data.firstName}</b>,<br />
              your appointment has been Booked please wait for approval!
            </p>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <table
              style="width: 100%; background-color: #FFFFFF; padding: 20px 50px"
            >
              <tr>
                <td colspan="2" style="text-align: center; padding-top: 20px">
                  <img src="cid:approved" alt="approved" style="max-width: 100%" />
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Your appointment has been booked and you can log in to see
                    your appointment details on your dashboard.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Please click the button below to view your dashboard
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="
                    text-align: center;
                    padding-top: 25px;
                    padding-bottom: 30px;
                  "
                >
                  <a
                    href=${urlP}
                    style="
                      display: inline-block;
                      background-color: #0094FF;
                      border: 1px solid #0094FF;
                      width: 155px;
                      height: 35px;
                      line-height: 35px;
                      border-radius: 20px;
                      font-size: 15px;
                      color: #FFFFFF;
                      text-decoration: none;
                    "
                    >Click Here</a
                  >
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <table style="width: 100%; padding: 0 20px; background-color: bisque">
              <tr>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:facebook" alt="facebook">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:instagram" alt="instagram">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:twitter" alt="twitter">
                </td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: center; padding-top: 20px">
                  <p>&copy; 2023 Nexus. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`,
  };
  const mailOptions2 = {
    from: process.env.AUTH_EMAIL,
    to: doctor.data.email,
    subject: "Appointment Booked",
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
        filename: "approved.png",
        path: "images/approved.png",

        cid: "approved",
      },
    ],
    html: `<html lang="en">
    <head>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital@1&display=swap');
    body{
      font-family: 'Poppins', sans-serif;
    }
  </style>
    </head>
    <body style="background-color: bisque;">
      <table
        style="
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: bisque;
          font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
            'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        "
      >
        <tr>
          <td colspan="2" style="text-align: center; padding: 20px 0">
            <img src="cid:nexuslogoalone" style="max-width: 100%"  alt="Nexus Logo"/>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <p>
              Hi, <b>${doctor.data.firstName}</b>,<br />
              your appointment has been Booked please wait for approval!
            </p>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <table
              style="width: 100%; background-color: #FFFFFF; padding: 20px 50px"
            >
              <tr>
                <td colspan="2" style="text-align: center; padding-top: 20px">
                  <img src="cid:approved" alt="approved" style="max-width: 100%" />
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Your were assigned an appointment and you can log in to see
                    the appointment details on your waitlist.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Please click the button below to accept or decline the appointment
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="
                    text-align: center;
                    padding-top: 25px;
                    padding-bottom: 30px;
                  "
                >
                  <a
                    href=${urlD}
                    style="
                      display: inline-block;
                      background-color: #0094FF;
                      border: 1px solid #0094FF;
                      width: 155px;
                      height: 35px;
                      line-height: 35px;
                      border-radius: 20px;
                      font-size: 15px;
                      color: #FFFFFF;
                      text-decoration: none;
                    "
                    >Click Here</a
                  >
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <table style="width: 100%; padding: 0 20px; background-color: bisque">
              <tr>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:facebook" alt="facebook">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:instagram" alt="instagram">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:twitter" alt="twitter">
                </td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: center; padding-top: 20px">
                  <p>&copy; 2023 Nexus. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`,
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      transporter
        .sendMail(mailOptions2)
        .then(() => {
          res.status(200).json({
            status: "OK",
            message: "Appointment successfully booked",
            data: savedAppointment,
          });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({
            status: "ERROR",
            message: "Failed To Send Email",
            error: error.message,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        status: "ERROR",
        message: "Failed To Send Email",
        error: error.message,
      });
    });
};

const sendApproveEmail = async (doctorId, appointment, res) => {
  const patient = await getPatientById(appointment.patientId);
  const doctor = await getDoctorById(doctorId);
  let urlP = `https://boye-dev-nexus.vercel.app/patient/messages`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: patient.data.email,
    subject: "Appointment Scheduled",
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
        filename: "approved.png",
        path: "images/approved.png",

        cid: "approved",
      },
      {
        filename: "nexuslogoalone.png",
        path: "images/nexuslogoalone.png",

        cid: "nexuslogoalone",
      },
    ],
    html: `<html lang="en">
    <head>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital@1&display=swap');
    body{
      font-family: 'Poppins', sans-serif;
    }
  </style>
    </head>
    <body style="background-color: bisque;">
      <table
        style="
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: bisque;
          font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
            'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        "
      >
        <tr>
          <td colspan="2" style="text-align: center; padding: 20px 0">
            <img src="cid:nexuslogoalone" style="max-width: 100%"  alt="Nexus Logo"/>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <p>
              Hi, <b>${patient.data.firstName}</b>,<br />
              your appointment has been approved!
            </p>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <table
              style="width: 100%; background-color: #FFFFFF; padding: 20px 50px"
            >
              <tr>
                <td colspan="2" style="text-align: center; padding-top: 20px">
                  <img src="cid:approved" alt="approved" style="max-width: 100%" />
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Your appointment has been approved by Dr ${doctor.data.lastName} and you can log in to see
                    your appointment details on your dashboard.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Please click the button below to chat directly to your
                    assigned Doctor.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="
                    text-align: center;
                    padding-top: 25px;
                    padding-bottom: 30px;
                  "
                >
                  <a
                    href=${urlP}
                    style="
                      display: inline-block;
                      background-color: #0094FF;
                      border: 1px solid #0094FF;
                      width: 155px;
                      height: 35px;
                      line-height: 35px;
                      border-radius: 20px;
                      font-size: 15px;
                      color: #FFFFFF;
                      text-decoration: none;
                    "
                    >Chat Now</a
                  >
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <table style="width: 100%; padding: 0 20px; background-color: bisque">
              <tr>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:facebook" alt="facebook">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:instagram" alt="instagram">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:twitter" alt="twitter">
                </td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: center; padding-top: 20px">
                  <p>&copy; 2023 Nexus. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`,
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      res.status(200).json({
        status: "OK",
        message: "Appointment successfully approved",
        data: appointment,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        status: "ERROR",
        message: "Failed To Send Email",
        error: error.message,
      });
    });
};

const sendCancelEmail = async (appointment, res) => {
  const patient = await getPatientById(appointment.patientId);
  const doctor = await getDoctorById(appointment.doctorId);
  let history = `https://boye-dev-nexus.vercel.app/patient/history`;
  let history2 = `https://boye-dev-nexus.vercel.app/doctor/history`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: patient.data.email,
    subject: "Appointment Cancelled",
    attachments: [
      {
        filename: "nexuslogoalone.png",
        path: "images/nexuslogoalone.png",
        cid: "nexuslogoalone",
      },
      {
        filename: "cross-icon.png",
        path: "images/cross-icon.png",
        cid: "crossicon",
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
        filename: "twitter.png",
        path: "images/twitter.png",
        cid: "twitter",
      },
    ],
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
    <body style="background-color: hsl(30, 38%, 90%);">
    <table style="width: 100%; max-width: 600px; margin: 0 auto;">
        <tr>
            <td style="text-align: center; padding: 30px;">
                <img src="cid:nexuslogoalone" alt="Nexus Logo" style="max-width: 100px;">
            </td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: center; font-size: 25px; padding: 20px;">
                Hi, <span style="font-weight: bold;">${patient.data.firstName}</span>,<br> your appointment has been cancelled!
            </td>
        </tr>
        <tr style="height: 400px;">
            <td colspan="2" style="background-color: #FFFFFF; padding: 20px; text-align: center;">
                <img src="cid:crossicon" alt="Cross Icon" style="width: 50px;"><br>
                <p style="line-height: 1.7em; margin-top: 10px;">Your appointment has been cancelled and you can log in to see your<br>appointment details on your dashboard.</p>
                <p style="line-height: 1.7em; margin-top: 20px;">Please click the button below to view</p>
                <p style="text-align: center; margin-top: 10px;">
                    <a hred=${history}><button style="background-color: #0094FF; border: 1px solid #0094FF; width: 155px; height: 35px; border-radius: 20px; font-size: 15px; color: #FFFFFF;">Click here</button></a>
                </p>
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
  };

  const mailOptions2 = {
    from: process.env.AUTH_EMAIL,
    to: doctor.data.email,
    subject: "Appointment Cancelled",
    attachments: [
      {
        filename: "nexuslogoalone.png",
        path: "images/nexuslogoalone.png",
        cid: "nexuslogoalone",
      },
      {
        filename: "cross-icon.png",
        path: "images/cross-icon.png",
        cid: "crossicon",
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
        filename: "twitter.png",
        path: "images/twitter.png",
        cid: "twitter",
      },
    ],
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
    <body style="background-color: hsl(30, 38%, 90%);">
    <table style="width: 100%; max-width: 600px; margin: 0 auto;">
        <tr>
            <td style="text-align: center; padding: 30px;">
                <img src="cid:nexuslogoalone" alt="Nexus Logo" style="max-width: 100px;">
            </td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: center; font-size: 25px; padding: 20px;">
                Hi, <span style="font-weight: bold;">${doctor.data.firstName}</span>,<br> your appointment has been cancelled!
            </td>
        </tr>
        <tr style="height: 400px;">
            <td colspan="2" style="background-color: #FFFFFF; padding: 20px; text-align: center;">
                <img src="cid:crossicon" alt="Cross Icon" style="width: 50px;"><br>
                <p style="line-height: 1.7em; margin-top: 10px;">Your appointment has been cancelled and you can log in to see your<br>appointment details on your dashboard.</p>
                <p style="line-height: 1.7em; margin-top: 20px;">Please click the button below to view</p>
                <p style="text-align: center; margin-top: 10px;">
                    <a hred=${history2}><button style="background-color: #0094FF; border: 1px solid #0094FF; width: 155px; height: 35px; border-radius: 20px; font-size: 15px; color: #FFFFFF;">Click here</button></a>
                </p>
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
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      transporter
        .sendMail(mailOptions2)
        .then(() => {
          res.status(200).json({
            status: "OK",
            message: "Appointment cancelled ",
          });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({
            status: "ERROR",
            message: "Failed To Send Email",
            error: error.message,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        status: "ERROR",
        message: "Failed To Send Email",
        error: error.message,
      });
    });
};

const sendRescheduleEmail = async (appointment, res) => {
  const patient = await getPatientById(appointment.patientId);
  const doctor = await getDoctorById(appointment.doctorId);
  let urlP = `https://boye-dev-nexus.vercel.app/doctor/messages`;
  let urlD = `https://boye-dev-nexus.vercel.app/patient/messages`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: patient.data.email,
    subject: "Appointment Rescheduled",
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
        filename: "approved.png",
        path: "images/approved.png",

        cid: "approved",
      },
    ],
    html: `<html lang="en">
    <head>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital@1&display=swap');
    body{
      font-family: 'Poppins', sans-serif;
    }
  </style>
    </head>
    <body style="background-color: bisque;">
      <table
        style="
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: bisque;
          font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
            'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        "
      >
        <tr>
          <td colspan="2" style="text-align: center; padding: 20px 0">
            <img src="cid:nexuslogoalone" style="max-width: 100%"  alt="Nexus Logo"/>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <p>
              Hi, <b>${patient.data.firstName}</b>,<br />
              your appointment has been Rescheduled!
            </p>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <table
              style="width: 100%; background-color: #FFFFFF; padding: 20px 50px"
            >
              <tr>
                <td colspan="2" style="text-align: center; padding-top: 20px">
                  <img src="cid:approved" alt="approved" style="max-width: 100%" />
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Your appointment has been rescheduled and you can log in to see
                    your appointment details on your dashboard.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Please click the button below to chat directly to your
                    assigned Doctor.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="
                    text-align: center;
                    padding-top: 25px;
                    padding-bottom: 30px;
                  "
                >
                  <a
                    href=${urlD}
                    style="
                      display: inline-block;
                      background-color: #0094FF;
                      border: 1px solid #0094FF;
                      width: 155px;
                      height: 35px;
                      line-height: 35px;
                      border-radius: 20px;
                      font-size: 15px;
                      color: #FFFFFF;
                      text-decoration: none;
                    "
                    >Chat Now</a
                  >
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <table style="width: 100%; padding: 0 20px; background-color: bisque">
              <tr>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:facebook" alt="facebook">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:instagram" alt="instagram">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:twitter" alt="twitter">
                </td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: center; padding-top: 20px">
                  <p>&copy; 2023 Nexus. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`,
  };

  const mailOptions2 = {
    from: process.env.AUTH_EMAIL,
    to: doctor.data.email,
    subject: "Appointment Rescheduled",
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
        filename: "approved.png",
        path: "images/approved.png",

        cid: "approved",
      },
    ],
    html: `<html lang="en">
    <head>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital@1&display=swap');
    body{
      font-family: 'Poppins', sans-serif;
    }
  </style>
    </head>
    <body style="background-color: bisque;">
      <table
        style="
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: bisque;
          font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
            'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        "
      >
        <tr>
          <td colspan="2" style="text-align: center; padding: 20px 0">
            <img src="cid:nexuslogoalone" style="max-width: 100%"  alt="Nexus Logo"/>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <p>
              Hi, <b>${doctor.data.firstName}</b>,<br />
              your appointment has been Rescheduled!
            </p>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <table
              style="width: 100%; background-color: #FFFFFF; padding: 20px 50px"
            >
              <tr>
                <td colspan="2" style="text-align: center; padding-top: 20px">
                  <img src="cid:approved" alt="approved" style="max-width: 100%" />
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Your appointment has been rescheduled and you can log in to see
                    your appointment details on your dashboard.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="text-align: center; padding-top: 25px; font-size: large"
                >
                  <p>
                    Please click the button below to chat directly to your
                    assigned Doctor.
                  </p>
                </td>
              </tr>
              <tr>
                <td
                  colspan="2"
                  style="
                    text-align: center;
                    padding-top: 25px;
                    padding-bottom: 30px;
                  "
                >
                  <a
                    href=${urlP}
                    style="
                      display: inline-block;
                      background-color: #0094FF;
                      border: 1px solid #0094FF;
                      width: 155px;
                      height: 35px;
                      line-height: 35px;
                      border-radius: 20px;
                      font-size: 15px;
                      color: #FFFFFF;
                      text-decoration: none;
                    "
                    >Chat Now</a
                  >
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-bottom: 20px">
            <table style="width: 100%; padding: 0 20px; background-color: bisque">
              <tr>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:facebook" alt="facebook">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:instagram" alt="instagram">
                </td>
                <td style="text-align: center; padding-top: 30px">
                  <img style="max-width: 24px; margin-left: 10px" src="cid:twitter" alt="twitter">
                </td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: center; padding-top: 20px">
                  <p>&copy; 2023 Nexus. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`,
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      transporter
        .sendMail(mailOptions2)
        .then(() => {
          res.status(200).json({
            status: "OK",
            message: "Appointment rescheduled ",
          });
        })
        .catch((error) => {
          console.log(error);
          return res.status(500).json({
            status: "ERROR",
            message: "Failed To Send Email",
            error: error.message,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        status: "ERROR",
        message: "Failed To Send Email",
        error: error.message,
      });
    });
};

const sendDeclineEmail = async (appointment, res) => {
  const patient = await getPatientById(appointment.patientId);
  let history = `https://boye-dev-nexus.vercel.app/patient/history`;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: patient.data.email,
    subject: "Appointment Declined",
    attachments: [
      {
        filename: "nexuslogoalone.png",
        path: "images/nexuslogoalone.png",
        cid: "nexuslogoalone",
      },
      {
        filename: "cross-icon.png",
        path: "images/cross-icon.png",
        cid: "crossicon",
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
        filename: "twitter.png",
        path: "images/twitter.png",
        cid: "twitter",
      },
    ],
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
    <body style="background-color: hsl(30, 38%, 90%);">
    <table style="width: 100%; max-width: 600px; margin: 0 auto;">
        <tr>
            <td style="text-align: center; padding: 30px;">
                <img src="cid:nexuslogoalone" alt="Nexus Logo" style="max-width: 100px;">
            </td>
        </tr>
        <tr>
            <td colspan="2" style="text-align: center; font-size: 25px; padding: 20px;">
                Hi, <span style="font-weight: bold;">${patient.data.firstName}</span>,<br> your appointment has been declined!
            </td>
        </tr>
        <tr style="height: 400px;">
            <td colspan="2" style="background-color: #FFFFFF; padding: 20px; text-align: center;">
                <img src="cid:crossicon" alt="Cross Icon" style="width: 50px;"><br>
                <p style="line-height: 1.7em; margin-top: 10px;">Your appointment has been declined and you can log in to see your<br>appointment details on your history.</p>
                <p style="line-height: 1.7em; margin-top: 20px;">Please click the button below to view</p>
                <p style="text-align: center; margin-top: 10px;">
                    <a hred=${history}><button style="background-color: #0094FF; border: 1px solid #0094FF; width: 155px; height: 35px; border-radius: 20px; font-size: 15px; color: #FFFFFF;">Click here</button></a>
                </p>
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
    </html>`,
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      res.status(200).json({
        status: "OK",
        message: "Appointment declined and no available doctors to reassign",
        data: appointment,
      });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({
        status: "ERROR",
        message: "Failed To Send Email",
        error: error.message,
      });
    });
};

module.exports = {
  sendBookEmail,
  sendApproveEmail,
  sendDeclineEmail,
  sendCancelEmail,
  sendRescheduleEmail,
};
