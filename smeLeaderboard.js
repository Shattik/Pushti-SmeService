const supabase = require("./db.js");
const router = require("express").Router();
const axios = require("axios");

async function getLeaderboardUrl() {
  try {
    let serviceRegisterUrl =
      String(process.env.serviceRegistryUrl) + "/get-service";
    response = await axios.post(serviceRegisterUrl, {
      name: process.env.leaderboardMsName,
    });
    // console.log(response.data);

    if (response.data.success) {
      return response.data.url;
    } else {
      console.log(response.data.message);
      return null;
    }
  } catch (error) {
    console.error("Error recovering leaderboard-data", error);
    return null;
  }
}

// {id:}
router.post("/", async (req, res) => {
  const leaderboardUrl = await getLeaderboardUrl();

  try {
    const smeLeaderboardUrl = leaderboardUrl + "/sme";
    const unionIdData = await supabase.any(
      `SELECT "unionId" FROM "User" where "id" = $1`,
      [req.body.id]
    );
    const unionId = unionIdData[0].unionId;

    const smeLeaderboard = await axios.post(smeLeaderboardUrl, {
      union_id: unionId,
    });

    const selfRankUrl = leaderboardUrl + "/user-rank";
    const selfRank = await axios.post(selfRankUrl, {
      user_id: req.body.id,
      union_id: unionId,
      account_type: "sme",
    });

    const response = {
      leaderboard: smeLeaderboard.data,
      selfRank: selfRank.data,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
