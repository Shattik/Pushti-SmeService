const router = require("express").Router();
const axios = require("axios");

async function getSupportMsUrl() {
  try {
    let serviceRegisterUrl =
      String(process.env.serviceRegistryUrl) + "/get-service";
    response = await axios.post(serviceRegisterUrl, {
      name: process.env.supportMsName,
    });
    // console.log(response.data);

    if (response.data.success) {
      return response.data.url;
    } else {
      console.log(response.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error recovering support-data", error);
    return null;
  }
}

// request body: { subject, details, userId }
router.post("/send-ticket", async (req, res) => {
    const supportMsUrl = await getSupportMsUrl();
    try {
        req.body.userType = "sme";
        const supportUrl = supportMsUrl + "/send-ticket";
        const response = await axios.post(supportUrl, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// send { id: userId}
router.post("/inbox", async (req, res) => {
    const supportMsUrl = await getSupportMsUrl();
    try {
        const inboxUrl = supportMsUrl + "/inbox";
        const response = await axios.post(inboxUrl, req.body);
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
