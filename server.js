const dotenv = require("dotenv");
// Load env vars
dotenv.config({ path: "./.env" });
const playwright = require('playwright-chromium');
const sendEmail = require("./sendEmail");
var CronJob = require("cron").CronJob;

const url = "https://login.hrworks.de/";
const company = "gruppeh";
const companyInput = "[name=company]";
const userInput = "[name=login]";
const passwordInput = "[id=id-1-31]";
const useFlow = "[id=id-1-46]";

const users = [{
  HRWORKS_USERNAME: "*****",
  EMAIL:"******",
  HRWORKS_PASSWORD: "*****"
}]

users.map(User => {

const user = User.HRWORKS_USERNAME;
const password = User.HRWORKS_PASSWORD;
const email = User.EMAIL;
var isWorkingDay = null;

let runner = async (page, browser, action = "start") => {
  try {
    if (action === "stop") {
      var button = page.locator('text="Stop working hours recording "', {
        delay: 50
      });
    } else if (action === "start") {
      var button = page.locator('text="Start working hours recording "', {
        delay: 50
      });
    }

    while (true) {
      let isVisible = await button.isVisible({ delay: 50 });
      console.log(`isVisible: ${action}`, isVisible);
      if (isVisible) {
        try {
          await button.click();
          console.log(`clicked on ${action}`);
        } catch (error) {
          console.log(`Failed to click on ${action}`);
        }
      } else {
        console.log("break loop");
        break;
      }
    }
    console.log("done");
    await browser.close();
  } catch (error) {
    console.log("error:", error);
  }
};

async function hrWorksLogin() {
  const browser = await playwright.chromium.launch({
    args: ["--start-maximized"],
    headless: true
  });
  const page = await browser.newPage();
  await page.goto(url);

  await (await page.waitForSelector(useFlow, { delay: 1000 })).click();
  await page.locator('text="Keep me logged in"', { delay: 50 }).click();

  await (
    await page.waitForSelector(userInput, { delay: 50 })
  ).type(user, { delay: 50 });
  await (
    await page.waitForSelector(passwordInput, { delay: 50 })
  ).type(password, { delay: 50 });
  await (
    await page.waitForSelector(companyInput, { delay: 50 })
  ).type(company, { delay: 50 });

  await page.locator('text=" Log in to HRworks"', { delay: 50 }).click();
  await page.locator('text=" Log in to HRworks"', { delay: 50 }).click();
  console.log("Logging in...");
  await page.waitForNavigation();
  await page.waitForLoadState("domcontentloaded");
  console.log("Logged In");
  isWorkingDay = await page
    .locator('text="Stop working hours recording "', { delay: 50 })
    .isVisible({ delay: 50 });
  console.log("isWorkingDay:", isWorkingDay);
  return { page, browser };
}

// Break
const breakRunner = async () => {
  const { page, browser } = await hrWorksLogin();
  if (isWorkingDay) {
    await runner(page, browser, "stop");
    await sendEmail({
      email,
      subject: "Break Started",
      message: ``
    });
    setTimeout(async () => {
      const { page, browser } = await hrWorksLogin();
      await runner(page, browser, "start");
      await sendEmail({
        email,
        subject: "Break Ended",
        message: ``
      });
    }, 30 * 60 * 1000);
  }
};

hrWorksLogin()
  sendEmail({
  email,
  subject: 'Test',
  message: ``
});
var clockedInCheck = new CronJob(
  "0 0 9 * * *",
  async function () {
    try {
      if (new Date().getDay() != 6 || new Date().getDay() != 7) {
        const { page, browser } = await hrWorksLogin();
        await browser.close();
        if (!isWorkingDay) {
          await sendEmail({
            email,
            subject: "Clock in reminder",
            message: `don't forget to clock-in \n ${url} `
          });
        }
      }
    } catch (error) {
      console.log("clockedInCheck error:", error);
    }
  },
  null,
  true,
  "Africa/Cairo"
);

var breakJob = new CronJob(
  "0 0 13 * * *",
  async function () {
    try {
      if (new Date().getDay() != 6 || new Date().getDay() != 7) {
        var rand = Math.floor(Math.random() * 5); //Generate Random number between 5 - 0
        setTimeout(async () => {
          await breakRunner();
        }, rand * 60 * 1000);
      }
    } catch (error) {
      console.log("breakJob error:", error);
    }
  },
  null,
  true,
  "Africa/Cairo"
);

var stopJob = new CronJob(
  "0 0 18 * * *",
  async function () {
    try {
      if (new Date().getDay() != 6 || new Date().getDay() != 7) {
        var rand = Math.floor(Math.random() * 5); //Generate Random number between 5 - 0
        setTimeout(async () => {
          const { page, browser } = await hrWorksLogin();
          if (isWorkingDay) {
            await runner(page, browser, "stop");
            await sendEmail({
              email,
              subject: "Clocked out",
              message: ``
            });
          }
        }, rand * 60 * 1000);
      }
    } catch (error) {
      console.log("stopJob error:", error);
    }
  },
  null,
  true,
  "Africa/Cairo"
);
})