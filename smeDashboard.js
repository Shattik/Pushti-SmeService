const supabase = require("./db.js");
const router = require("express").Router();

async function processSellHistoryData(sellHistoryData, buyHistoryData) {
  let transactionData = {};
  for (let i = 0; i < sellHistoryData.length; i++) {
    const month = sellHistoryData[i].month_no;
    const total = sellHistoryData[i].total;
    if (transactionData[month]) {
      transactionData[month] =
        parseFloat(transactionData[month]) + parseFloat(total);
    } else {
      transactionData[month] = parseFloat(total);
    }
  }

  for (let i = 0; i < buyHistoryData.length; i++) {
    const month = buyHistoryData[i].month_no;
    const total = buyHistoryData[i].total;
    if (transactionData[month]) {
      transactionData[month] =
        parseFloat(transactionData[month]) + parseFloat(total);
    } else {
      transactionData[month] = parseFloat(total);
    }
  }

  // convert the object to an array of objects
  let transactionDataArray = [];
  for (const [key, value] of Object.entries(transactionData)) {
    transactionDataArray.push({ month_no: key, total: value });
  }

  const monthName = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // now fill the missing month
  let currentMonth = new Date().getMonth() + 1;
  let currentYear = new Date().getFullYear();

  let monthYears = [];
  let last12Months = [];
  for (let i = 0; i < 12; i++) {
    last12Months.push(currentMonth);
    monthYears.push(currentYear);
    currentMonth--;
    if (currentMonth == 0) {
      currentMonth = 12;
      currentYear--;
    }
  }
  // now we have the last 12 months in sorted order
  // now we have to check if there is any missing month in the transactionDataArray
  // if there is any missing month, then we have to add that month with 0 amount

  //  now iterate through the transactionDataArray following the last12Months array, and add a field named amount as well as month name (Jan-24, Feb-24, Mar-24, ....)

  let last12MonthsIndex = 0;
  let last12MonthsLength = last12Months.length;

  // transactionDataArrayReturned is the array that will be returned, it will contain the last 12 months data

  let transactionDataArrayReturned = [];

  for (
    last12MonthsIndex = 0;
    last12MonthsIndex < last12MonthsLength;
    last12MonthsIndex++
  ) {
    let month_no = last12Months[last12MonthsIndex];

    // check if the month_no is present in the transactionDataArray, if present, find the index and add the amount and month name with year in the transactionDataArrayReturned array
    // if not present, add the month_no with 0 amount

    let found = false;
    for (
      let transactionDataArrayIndex = 0;
      transactionDataArrayIndex < transactionDataArray.length;
      transactionDataArrayIndex++
    ) {
      if (
        transactionDataArray[transactionDataArrayIndex].month_no == month_no
      ) {
        // month_no is present in the transactionDataArray
        found = true;
        transactionDataArrayReturned.push({
          month:
            monthName[month_no - 1] +
            "-" +
            monthYears[last12MonthsIndex].toString().slice(2),
          total: transactionDataArray[transactionDataArrayIndex].total,
        });
        break;
      }
    }

    // if the month_no is not present in the transactionDataArray, add the month_no with 0 amount
    if (!found) {
      transactionDataArrayReturned.push({
        month:
          monthName[month_no - 1] +
          "-" +
          monthYears[last12MonthsIndex].toString().slice(2),
        total: 0,
      });
    }
  }

  // reverse the transactionDataArrayReturned array
  transactionDataArrayReturned.reverse();

  return transactionDataArrayReturned;
}

router.post("/", async (req, res) => {
  console.log("Holla bro");
  console.log(req.body.id);
  let response = await supabase.any(
    `SELECT "name", "nid", "email", "phone", "avatarLink", "permanentAddress",  "dob",  (SELECT "name" AS "unionName" FROM "UnionParishad" where "UnionParishad"."id" = "unionId"), \
    (SELECT "name" AS "agentName" FROM "User" where "id" = (SELECT "agentId" FROM "Sme" where "Sme"."id" = $1)) \
    FROM "User" where "id" = $1;`,
    [req.body.id]
  );
  const basicData = response[0];

  console.log(basicData);
  let rankandpointArray = await supabase.any(
    `SELECT "rank", "points" FROM "Sme" where "Sme"."id" = $1;`,
    [req.body.id]
  );

  let rankandpoint = rankandpointArray[0];

  console.log(rankandpoint);

  // populate data table for next rank point point reaching
  let rankTable = await supabase.any(
    `SELECT "className", "max", "min", "cashback", "nextRank" FROM "Rank" where "Rank"."className" = $1`,
    [rankandpoint.rank]
  );

  rankandpoint.minPoint = rankTable[0].min;
  rankandpoint.maxPoint = rankTable[0].max;
  rankandpoint.nextRank = rankTable[0].nextRank;
  rankandpoint.cashback = rankTable[0].cashback;

  let sellHistoryData = await supabase.any(
    `SELECT EXTRACT('MONTH' FROM "timestamp") AS month_no, SUM("total") as total \
    FROM "SmeSell" \
    where "smeId" = $1 and "status" = 'approved' and "timestamp" > NOW() - INTERVAL '1 year' \
    GROUP BY EXTRACT('MONTH' FROM "timestamp");`,
    [req.body.id]
  );

  let buyHistoryData = await supabase.any(
    `SELECT EXTRACT('MONTH' FROM "timestamp") AS month_no, SUM("total") as total \
    FROM "SmeBuy" \
    where "smeId" = $1 and "status" = 'approved' and "timestamp" > NOW() - INTERVAL '1 year' \
    GROUP BY EXTRACT('MONTH' FROM "timestamp");`,
    [req.body.id]
  );

  console.log(buyHistoryData);

  let transactionHistoryOneYear = await processTransactionHistoryData(
    sellHistoryData,
    buyHistoryData
  );
  const responseObj = { basicData, rankandpoint, transactionHistoryOneYear };

  console.log(responseObj);

  res.status(200).json(responseObj);
});

module.exports = router;
