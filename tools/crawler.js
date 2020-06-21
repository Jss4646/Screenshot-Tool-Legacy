const sitemapParser = require('sitemap-stream-parser');

const parseSitemapsPromise = (urlHost) => {
    return new Promise(((resolve, reject) => {
        let urls = []
        sitemapParser.parseSitemaps(`https://${urlHost}/sitemap.xml`, url => urls.push(url), err => {
            if (err) return reject(err)
            resolve(urls)
        })
    }))
}

function crawSitemap(url) {
    let urlHost = new URL(url).hostname
    console.log(`Getting sitemap for ${urlHost}`);

    return parseSitemapsPromise(urlHost)
}

async function crawlSitemapEndpoint(req, res) {
    res.send(await crawSitemap(req.body.url))
}

module.exports = {
    crawlSitemapEndpoint,
    crawSitemap,
};