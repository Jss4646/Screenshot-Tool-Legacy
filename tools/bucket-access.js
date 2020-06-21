const AWS = require('aws-sdk')

AWS.config.update({region: 'us-west-2'});
AWS.config.update({
    accessKeyId: "AKIARJLWD3FYMMWLZ7MQ",
    secretAccessKey: "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"
});

const s3 = new AWS.S3({apiVersion: "2006-03-01"})

function uploadScreenshot(screenshotData, path) {
    let bucketParams = {
        Bucket: 'screenshot-tool',
        Key: path,
        Body: screenshotData,
    }

    let uploadPromise = s3.upload(bucketParams).promise();
    return uploadPromise
        .then(data => {
            return data.Location
        })
        .catch(err => {
            return err;
        })
}

module.exports = {
    uploadScreenshot,
}