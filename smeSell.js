const supabase = require("./db.js");
const router = require("express").Router();
const axios = require("axios");

async function getSellMsUrl() {
    try {
        let serviceRegisterUrl =
        String(process.env.serviceRegistryUrl) + "/get-service";
        response = await axios.post(serviceRegisterUrl, {
        name: process.env.sellMsName,
        });
        console.log(response.data);
    
        if (response.data.success) {
        return response.data.url;
        } else {
        console.log(response.data.message);
        return null;
        }
    } catch (error) {
        console.error("Error recovering sell-data", error);
        return null;
    }
}


router.post("/history", async (req, res) => {
    const sellMsUrl = await getSellMsUrl();
    const historyUrl = sellMsUrl + "/sell-history/sme";
    console.log(historyUrl);
    const req_data = { sme_id: req.body.id};
    try {
        const response = await axios.post(historyUrl, req_data);
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/sell-response/accept", async (req, res) => {
    const sellMsUrl = await getSellMsUrl();
    const historyUrl = sellMsUrl + "/sell-response/sme/accept";
    const req_data = { id: req.body.id};
    try {
        const response = await axios.post(historyUrl, req_data);
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.post("/sell-response/reject", async (req, res) => {
    const sellMsUrl = await getSellMsUrl();
    const historyUrl = sellMsUrl + "/sell-response/sme/reject";
    const req_data = { id: req.body.id};
    try {
        const response = await axios.post(historyUrl, req_data);
        res.status(200).json(response.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;