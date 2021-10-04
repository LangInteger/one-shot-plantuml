const express = require('express');
const app = express();

// for view rendering
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/views'));

// for webcrawler
const puppeteer = require('puppeteer');
const port = process.env.PORT || 8080;
const validUrl = require('valid-url');
const path = require('path');

var browser = null;

// generate random number
function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
  }

// Get random puml file address (github raw usercontent) recently edited in github
async function getUrl() {
    // use existed browser
    const page = await browser.newPage();
    console.log("Step 1 page opened");
    let githubUrl = null;
    let rawContentUrl = null;

    try {
        // must guarantee that already logined
        await page.goto("https://github.com");
        await page.waitForSelector('body > div.position-relative.js-header-wrapper > header > div.Header-item.mr-0.mr-md-3.flex-order-1.flex-md-order-none > notification-indicator > a > svg', {visible: true, timeout: 10000 });
        console.log("Step 2 logined");
    
        // search puml file with random page
        // sometimes this page is rendered without result list, retry should be set
        const randomUrl = "https://github.com/search?l=&o=desc&p=" + between(1, 100) + "&q=language%3APlantUML&s=indexed&type=Code";
        const fileItemSelector = "#code_search_results > div.code-list > div:nth-child(" + between(1, 10) + ") > div > div.f4.text-normal > a";
        try {
            await page.goto(randomUrl);
            await page.waitForSelector(fileItemSelector, {visible: true, timeout: 5000 });
        } catch (e) {
            console.log("search page go wrong without result list, try again");
            await page.goto(randomUrl);
            await page.waitForSelector(fileItemSelector, {visible: true, timeout: 5000 });
        }
        
        await page.$eval(fileItemSelector, el => el.click());
        await page.waitForSelector('#raw-url', {visible: true, timeout: 10000 })
        githubUrl = page.url();
        await page.$eval('#raw-url', el => el.click());
        rawContentUrl = page.url();
        console.log("Step 3 searched");
    } catch (e) {
        console.log("cur url: ", page.url());
        console.log("exception: " + e);
        return [false, 
            "https://github.com/LangInteger/one-shot-plantuml/blob/main/docs/500.puml", 
            "https://raw.githubusercontent.com/LangInteger/one-shot-plantuml/main/docs/500.puml"];
    } finally {
      await page.close();
      console.log("Step 4 closed");
    }
    return [true, githubUrl, rawContentUrl];
}

app.get('/getUrl', async function(req, res) {
    const result = await getUrl();
    res.send(result);
});

app.get('/', async function(req, res) {
    let ret = await getUrl();
    console.log("url: " + ret);
    res.render('index', {url: ret[1], githubUrl: ret[2]});
});

// only login, and consider verification code
app.get('/login', async function(req, res) {
    if (browser == null) {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW 64; Trident/7.0; rv:11.0) like Gecko']
            // headless: false
        });
    }
    
    const page = await browser.newPage();
    console.log("Step 1 page opened");

    try {
        // login
        await page.goto("https://github.com/login");

        // it seems that there is no good clojure support
        const username = process.env.GITHUB_USERNAME;
        await page.evaluate((username) => {
            const target = document.querySelector('#login_field');
            target.value = username;
        }, username);
        
        const password = process.env.GITHUB_PASSWORD;
        await page.evaluate((password) => {
            const target = document.querySelector('#password');
            target.value = password;
        }, password);
        
        await page.$eval('#login > div.auth-form-body.mt-3 > form > div > input.btn.btn-primary.btn-block.js-sign-in-button', el => el.click());

         try {
             // verification code
             await page.waitForSelector('#otp', {visible: true, timeout: 5000 })
             console.log('otp appears');
             await new Promise(resolve => setTimeout(resolve, 30000));
             const code = process.env.CODE;
             console.log("verification code: " + code);

             await page.evaluate((code) => {
                 const target = document.querySelector('#otp');
                 target.value = code;
             }, code);


             console.log("input verification code: ", code);
             await page.$eval('#login > div.auth-form-body.mt-3 > form > button', el => el.click());
             console.log("click verificate button");

             await page.waitForSelector('body > div.position-relative.js-header-wrapper > header > div.Header-item.mr-0.mr-md-3.flex-order-1.flex-md-order-none > notification-indicator > a > svg', {visible: true, timeout: 10000 });
             console.log("Step 2 logined");
         } catch (e) {
             // verification may not needed, continue
             console.log("No verificate page, cur url: ", page.url());
             console.log("exception: " + e);
         } 
        
    } catch (e) {
        console.log("cur url: ", page.url());
        console.log("exception: " + e);
        return "error";
    } finally {
      await page.close();
      console.log("Step 3 page closed");
    }
    return 'success';
});

// for save verificate code temporarily
app.get('/setCode', async function(req, res) {
    process.env.CODE = req.query.code;
    res.send("set success");
});

app.get('/getCode', async function(req, res) {
    res.send(process.env.CODE);
});

app.listen(port, function() {
    console.log('App listening on port ' + port)
})
