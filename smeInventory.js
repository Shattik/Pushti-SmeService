const supabase = require("./db.js");
const router = require("express").Router();
const axios = require("axios");

async function getProductMsUrl() {
  try {
    let serviceRegisterUrl =
      String(process.env.serviceRegistryUrl) + "/get-service";
    response = await axios.post(serviceRegisterUrl, {
      name: process.env.productMsName,
    });
    console.log(response.data);

    if (response.data.success) {
      return response.data.url;
    } else {
      console.log(response.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error recovering product-data", error);
    return null;
  }
}

router.post("/", async (req, res) => {
  console.log("Hola");
  const productMsUrl = await getProductMsUrl();
  const inventoryUrl = productMsUrl + "/inventory";

  console.log(inventoryUrl);

  const req_data = { user_id: req.body.id};

  try {
    const response = await axios.post(inventoryUrl, req_data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
