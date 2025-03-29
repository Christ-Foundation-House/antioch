const csvFilePath = "./data3_to_csv.csv";
const csv = require("csvtojson");
const fetch = require("node-fetch");
const moment = require("moment");
let count = 0;
try {
  csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      // console.log(jsonObj);
      jsonObj.forEach((rowRaw) => {
        // delete rowRaw.completion_time;
        // delete rowRaw.start_time;

        //for member with no or fake numbers
        if (rowRaw.phone_number === "") {
          rowRaw.phone_number = "a" + count;
          count++;
        }

        const row = {
          ...rowRaw,
          is_requesting_salvation_rededication:
            rowRaw.is_requesting_salvation_rededication === "Yes"
              ? true
              : false,
          is_requesting_prayer:
            rowRaw.is_requesting_prayer === "Yes" ? true : false,
          start_time: moment(rowRaw.start_time).utc().format(),
          completion_time: moment(rowRaw.scompletion_time).utc().format(),
        };
        // console.log(row);
        // return;
        fetch("http://localhost:3000/api/wicf/member", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(row),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            if (data.isError === true) {
              console.log("THIS GUY HAS AN ISSUE", row);
              throw new Error();
            }
          })
          .catch((error) => {
            console.error(error);
            throw new Error();
          });
      });
    });
} catch (e) {
  console.error("DATA FAILED TO UPLOAD FULLY", e);
}
