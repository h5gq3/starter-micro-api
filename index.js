// use puppeteer to periodically scrape the page and get the data
const puppeteer = require("puppeteer");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
// http server
const http = require("http");

// personal code
const personalCode = process.env.PERSONAL_CODE;

// url of Digiregistratuur
const url = "https://www.digiregistratuur.ee";

const getData = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  // wait for selector `#form\:loginBtn` to appear in DOM
  await page.waitForSelector("#form:loginBtn");
  // click on the selector
  await page.click("#form:loginBtn");
  // wait for selector `#sid-personal-code` to appear in DOM
  await page.waitForSelector("#sid-personal-code");
  // type personal code into the selector
  await page.type("#sid-personal-code", personalCode);
  // click on the `#smartIdForm > table > tbody > tr:nth-child(2) > td:nth-child(2) > button` selector
  await page.click(
    "#smartIdForm > table > tbody > tr:nth-child(2) > td:nth-child(2) > button"
  );
  // user has to authenticate with smart id
  // if authentication is successful, the page will redirect to the Digiregistratuur dashboard
  //
  // scrape the data of open reservations
  //
  // wait for selector `#form\:fullListTable\:0\:appointmentBtn` to appear in DOM
  await page.waitForSelector("#form:fullListTable:0:appointmentBtn");
  // click on the selector
  await page.click("#form:fullListTable:0:appointmentBtn");
  // wait for selector `#form\:changeBtn` to appear in DOM
  await page.waitForSelector("#form:changeBtn");
  // click on the selector
  await page.click("#form:changeBtn");
  // wait for selector `#form\:county` to appear in DOM
  await page.waitForSelector("#form:county");
  // click on the selector
  await page.click("#form:county");
  // wait for selector `#form\:county_11` to appear in DOM
  await page.waitForSelector("#form:county_11");
  // click on the selector
  await page.click("#form:county_11");
  // wait for selector `#form\:changeBtn` to appear in DOM
  await page.waitForSelector("#form:changeBtn");
  // click on the selector
  await page.click("#form:changeBtn");
  // wait for selector `#form\:freeSlotTable > div > table` to appear in DOM
  await page.waitForSelector("#form:freeSlotTable > div > table");
  // get the data of the table
  const data = await page.evaluate(() => {
    const tds = Array.from(
      document.querySelectorAll(
        "#form:freeSlotTable > div > table > tbody > tr > td"
      )
    );
    return tds.map((td) => td.innerText);
  });
  await browser.close();
  return data;
};

// const uploadToS3 = async (data) => {
//   const params = {
//     Bucket: "cyclic-wide-eyed-hospital-gown-bull-eu-north-1",
//     Key: "data.json",
//     Body: JSON.stringify(data),
//   };
//   return s3.upload(params).promise();
// }

// get the data and return it as a json
const server = http.createServer(async (req, res) => {
  const data = await getData();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
});

server.listen(process.env.PORT || 3000);
