const url = require('url');
const Confluence = require("confluence-api");
const config = {
    username: process.env.confluence_username || 'username',
    password: process.env.confluence_password || 'password',
    baseUrl:  "https://confluence.pragmatic.agency/",
};

const confluence = new Confluence(config)

const postContentPromise = (space, title, content, parentId) => {
    return new Promise(((resolve, reject) => {
        confluence.postContent(space, title, content, parentId, (err, data) => {
            if (err) reject(err);
            console.log('Page created');
            resolve(data);
        })
    }))
}

const putContentPromise = (space, id, version, title, content) => {
    return new Promise(((resolve, reject) => {
        confluence.putContent(space, id, version, title, content, (err, data) => {
            if (err) reject(err);
            console.log('Page updated');
            resolve(data);
        })
    }))
}

const getContentByPageTitlePromise = (space, title) => {
    return new Promise(((resolve, reject) => {
        confluence.getContentByPageTitle(space, title, (err, data) => {
            if (err) reject(err);
            resolve(data);
        })
    }))
}

async function setScreenshotPage(title, content) {
    let pageResponse = await getContentByPageTitlePromise("SCREEN", title)
    let page = pageResponse.results[0];

    try {
        if (page) {
            await putContentPromise('SCREEN', page.id, page.version.number + 1, title, content);
        } else {
            page = await postContentPromise('SCREEN', title, content, null)
        }
    } catch (err) {
        console.log(err);
    }


    return page;
}

async function setScreenshotPageEndpoint(req, res) {
    let title = req.body.host;
    let screenshotLinks = req.body.screenshotLinks;

    let paths = '';
    let images = '';
    screenshotLinks.forEach(screenshotLink => {
        let link = url.parse(screenshotLink);
        paths = `${paths}<td><p style="width: 100%; text-align: center">${link.path}</p></td>`
        images = `${images}<td><img src="${screenshotLink}" style="width: 300px"></img></td>`
    })

    let content = `<table><tr>${paths}</tr><tr>${images}</tr></table>`
    let page = await setScreenshotPage(title, content)
    res.send(page);
}

module.exports = {setScreenshotPageEndpoint};