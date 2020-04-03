'use strict';
const puppeteer = require('puppeteer');
require('dotenv').config();

async function getAudits(selector) {
    let audits = [];
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(process.env.URL);

        // Type into search box.
        await page.type('.form-control', process.env.EMAIL);
        await page.type('.form-control.input-last', process.env.PASSWORD);
        await page.click('button');


        // Wait for the results page to load and display the results.
        //tr[data-date_start|="2020"]
        const resultsSelector = selector;
        await page.waitForSelector(resultsSelector);

        // Extract the results from the page.
        audits = await page.evaluate(resultsSelector => {
            const names = Array.from(document.querySelectorAll(resultsSelector));
            return names.map(name => {
                return name.innerHTML;
            });
        }, resultsSelector);
        // console.log(audits);

        await browser.close();

    return audits;
}

module.exports = getAudits;
