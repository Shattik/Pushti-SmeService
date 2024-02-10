const supabase = require("./db.js");
const router = require("express").Router();
const axios = require("axios");

const loanMsUrl = process.env.loanMsUrl;

async function getLoanMsUrl() {
  try {
    let serviceRegisterUrl =
      String(process.env.serviceRegistryUrl) + "/get-service";
    response = await axios.post(serviceRegisterUrl, {
      name: process.env.loanMsName,
    });
    // console.log(response.data);

    if (response.data.success) {
      return response.data.url;
    } else {
      console.log(response.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error recovering location-data", error);
    return null;
  }
}

router.post("/", async (req, res) => {
  const loanMsUrl = await getLoanMsUrl();
  const historyUrl = loanMsUrl + "/loan_history/sme";

  const req_data = { sme_id: req.body.id, page: req.body.page };

  try {
    const response = await axios.post(historyUrl, req_data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/request", async (req, res) => {
  const loanMsUrl = await getLoanMsUrl();
  const requestUrl = loanMsUrl + "/loan_request/sme";

  // const { sme_id, agent_id, min, max, description } = req.body;

  //   get agent_id
  let data = await supabase.any(
    `SELECT "agentId" FROM "Sme" where id = $1`,
    [req.body.id]
  );
  const agent_id = data[0].agentId;

  const req_data = {
    sme_id: req.body.id,
    agent_id: agent_id,
    min: req.body.min,
    max: req.body.max,
    description: req.body.description,
  };

  try {
    const response = await axios.post(requestUrl, req_data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;