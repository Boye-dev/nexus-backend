const Subscribers = require("../models/Subscribers");

module.exports.getSubscribers = async (req, res) => {
    try {
  
      // Find announcements with patientId
      const subscribers = await Subscribers.find();
  
      res.status(200).json({
        status: 'OK',
        message: 'Subscribers retrieved successfully',
        data: subscribers,
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to retrieve Subscribers',
        error: error.message,
      });
    }
};

module.exports.createSubscriber = async (req, res) => {
    try {
        const { email, fullname } = req.body;
  
        const userExist = await Subscribers.find({email: email})

        if (userExist && userExist.length > 0) {
            res.status(201).json({
                status: 'OK',
                message: 'Already a Subscriber',
            });
        } else {
            // Create a new subscriber object
            const newSubscriber = new Subscribers({
                email,
                fullName: fullname,
                createdAt: new Date(),
            });
        
            // Save the new Subscriber to the database
            await newSubscriber
                .save()
                .then(() => {
                    res.status(201).json({
                        status: 'OK',
                        message: 'Successfully Subscribed to our Newsletters',
                    });
                })
                .catch((error) => {
                    res.status(500).json({
                        status: 'ERROR',
                        message: 'Failed to Subscribe to our Newsletters',
                        error: error.message
                    });
                })
        }

    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Failed to Subscribe to our Newsletters',
        error: error.message,
      });
    }
  };
  
