import puppeteer from "puppeteer";
import express from "express";

const router = express.Router();




router.get('/:slug', async (req, res) => {
    const data = req.params.slug.toLowerCase().replace(" ", "%20")
    let browser;
    try {
        const path_to_exe = "C:/Users/krish/.cache/puppeteer/chrome/win64-128.0.6613.86/chrome-win64/chrome.exe";
        const browser = await puppeteer.launch();
        // browser = await puppeteer.launch({
        //     executablePath: path_to_exe,
        //     defaultViewport: false,
        //     headless: false,
        //     // args: [
        //     //     '--use-fake-ui-for-media-stream',
        //     //     '--enable-features=NetworkService,NetworkServiceInProcess'
        //     // ]
        // });

        const page = await browser.newPage();


        const medpage = "https://www.1mg.com/search/all?filter=true&name=" + data;

        await page.goto(medpage);

        await page.waitForSelector('#category-container > div > div.col-xs-12.col-md-10.col-sm-9 > div:nth-child(2) > div > div > div > div.row.style__grid-container___3OfcL')



// #category-container > div > div.col-xs-12.col-md-10.col-sm-9 > div.style__div-description___1pa6p > span
// #category-container > div > div.col-xs-12.col-md-10.col-sm-9 > div.style__div-description___1pa6p > span





// #category-container > div > div.col-xs-12.col-md-10.col-sm-9 > div:nth-child(2) > div > div > div > div.row.style__grid-container___3OfcL
// #category-container > div > div.col-xs-12.col-md-10.col-sm-9 > div:nth-child(2) > div.col-md-9 > div > div.product-card-container.style__sku-list-container___jSRzr > div:nth-child(3) > div:nth-child(1)
// #category-container > div > div.col-xs-12.col-md-10.col-sm-9 > div:nth-child(2) > div.col-md-9 > div > div.product-card-container.style__sku-list-container___jSRzr > div:nth-child(3)
// #category-container > div > div.col-xs-12.col-md-10.col-sm-9 > div:nth-child(2) > div > div > div > div.row.style__grid-container___3OfcL
        const cardsData = await page.evaluate(async () => {

            const response = document.querySelector("#category-container > div > div.col-xs-12.col-md-10.col-sm-9 > div:nth-child(2) > div > div > div > div.row.style__grid-container___3OfcL> div > div:nth-child(1)");

            const name = response.querySelector('div > a > div.style__product-description___zY35s > div.style__pro-title___3G3rr').innerText
            const price = response.querySelector('div > a > div.style__product-pricing___1OxnE > div > div.style__price-tag___KzOkY').innerText
            const link = response.querySelector('div > a').href
            res_data = { vendor: "1mg", name, price, link }

            return res_data;
        });

        res.json(cardsData);




    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "server error" });
    }
    finally {
        browser?.close();
    }
});

export default router;



















 // const context = browser.defaultBrowserContext();
        // await context.overridePermissions("https://www.1mg.com", ['geolocation']);

        // await page.setGeolocation({ latitude: 27.176670, longitude: 78.008072 });
        
        // await new Promise(resolve => setTimeout(resolve, 5000));
        
        // page.waitForSelector('#update-city-modal > div')
        // page.mouse.click('#update-city-modal > div > div.UpdateCityModal__update-confirm___1iV9N > div.UpdateCityModal__update-btn___2qmN1.UpdateCityModal__btn___oMW5n')
       