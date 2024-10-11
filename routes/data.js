import axios from "axios"
import express from "express";

const router = express.Router();




router.get('/:slug', (req, res) => {
    const city_name = req.query.city;
    const idx = req.query.idx || 0;
    const data = req.params.slug.toLowerCase().replace(" ", "%20");
    try {
        axios.get('https://www.1mg.com/search/all?filter=true&name=' + data, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Referer': 'https://www.1mg.com/',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'cookie': `city=${city_name}`
            }
        }).then(response => {
            var str_new = response.data.slice(response.data.indexOf('window.PRELOADED_STATE') + 26)
            var finale_str = str_new.slice(0, str_new.indexOf('</script>') - 2)
            var a = JSON.parse(JSON.parse(finale_str))
            var b = Array.from(a.searchPage.productList[0].data)[idx]
            res.status(200).json({ vendor: "1mg", name: b?.name, price: b.discountedPrice || b.price, link: `https://www.1mg.com${b.url}` });
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "server error" });
    }
});

export default router;