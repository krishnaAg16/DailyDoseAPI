import axios from "axios";
import express from "express";
import * as cheerio from 'cheerio';

const router = express.Router();

const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
};

const cityCache = new Map();

const fetchCityFromPincode = async (pincode) => {
    if (cityCache.has(pincode)) {
        return cityCache.get(pincode);
    }

    const city = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`)
        .then(res => res.data[0]?.PostOffice?.[0].District)
        .catch(error => {
            console.error('Error fetching city name:', error);
            return null;
        });

    if (city) cityCache.set(pincode, city);
    return city;
};

const fetchFrom1mg = async (data, pincode) => {
    try {
        const city = await fetchCityFromPincode(pincode);
        if (!city) return [];

        const response = await axios.get(`https://www.1mg.com/search/all?filter=true&name=${data}`, {
            headers: {
                ...commonHeaders,
                'Referer': 'https://www.1mg.com/',
                'cookie': `city=${city}`
            }
        });

        const dataIndex = response.data.indexOf('window.PRELOADED_STATE');
        if (dataIndex === -1) {
            console.error('window.PRELOADED_STATE not found in 1mg response');
            return [];
        }

        const str_new = response.data.slice(dataIndex + 26);
        const finale_str = str_new.slice(0, str_new.indexOf('</script>') - 2);

        const parsedData = JSON.parse(JSON.parse(finale_str));
        const products = parsedData?.searchPage?.productList?.[0]?.data || [];

        return products.map(c => ({
            vendor: "1mg",
            name: c.name,
            price: c.discountedPrice || c.price,
            link: `https://www.1mg.com${c.url}`
        }));
    } catch (error) {
        console.error('Error fetching data from 1mg:', error.message);
        return [];
    }
};

const fetchFromPharmeasy = async (data, pincode) => {
    try {
        const firstResponse = await axios.get(`https://pharmeasy.in/search/all?name=${data}`, {
            headers: {
                ...commonHeaders,
                'Referer': 'https://pharmeasy.in/',
            }
        });

        const cookies = firstResponse.headers['set-cookie']
            .reduce((acc, cookie) => {
                const parts = cookie.split(';');
                const [name, value] = parts[0].split('=');
                acc[name.trim()] = value.trim();
                return acc;
            }, {});

        const cookieStr = Object.entries(cookies)
            .map(([key, value]) => `${key}=${value}`).join('; ') + `; X-Default-City=125; X-Pincode=${pincode}`;

        const secondResponse = await axios.get(`https://pharmeasy.in/search/all?name=${data}`, {
            headers: {
                ...commonHeaders,
                'Referer': 'https://pharmeasy.in/api/app/fetchPincodeDetails',
                'Cookie': cookieStr,
            }
        });

        const $ = cheerio.load(secondResponse.data);
        const results = [];

        $('#__next > main > div > div > div > div.LHS_container__mrQkM.Search_fullWidthLHS__mteti > div:not(:first-child):not(:last-child)')
            .each((index, element) => {
                const name = $(element).find('div.ProductCard_infoContainer__Ro1Gi h1').text().trim();

                if (!name) return;

                let priceElement = $(element).find('div.ProductCard_infoContainer__Ro1Gi > div > div.ProductCard_productWarningAndCta__kKe3q > div > div.ProductCard_warningPriceInfo__Dod00 > div:nth-child(1) > div > div.ProductCard_ourPrice__yDytt');

                if (!priceElement.length) {
                    priceElement = $(element).find('div.ProductCard_infoContainer__Ro1Gi > div > div.ProductCard_productWarningAndCta__kKe3q > div > div.ProductCard_warningPriceInfo__Dod00 > div:nth-child(1) > div > div > div.ClickableElement_clickable__ItKj2 > div > span:nth-child(1)');
                }

                const price = priceElement.text().trim();
                const link = $(element).find('div > div > a').attr('href');

                if (name && price && link) {
                    results.push({
                        vendor: "Pharmeasy",
                        name,
                        price: price.replace(/[₹*]/g, ''),
                        link: `https://pharmeasy.in${link}`
                    });
                }
            });

        return results;

    } catch (error) {
        console.error('Error fetching data from Pharmeasy:', error.message);
        return [];
    }
};

router.get('/:slug', async (req, res) => {
    const { pincode } = req.query;
    const { slug } = req.params;
    const data = slug.toLowerCase().replace(" ", "%20");

    try {
        const [oneMgData, pharmeasyData] = await Promise.all([
            fetchFrom1mg(data, pincode),
            fetchFromPharmeasy(data, pincode)
        ]);

        const combinedResults = [...oneMgData, ...pharmeasyData];

        res.status(200).json(combinedResults);
    } catch (error) {
        console.error('Error combining data:', error.message);
        res.status(500).json({ error: "server error" });
    }
});

export default router;
