const AWS = require("aws-sdk");
const requireLogin = require("../middlewares/requireLogin");
const uuid = require("uuid/v1");
const keys = require("../config/keys");

const s3 = new AWS.S3({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey,
    signatureVersion: "v4",
    region: "eu-west-2"
});

module.exports = app => {
    app.get("/api/upload", requireLogin, (req, res) => {
        const key = `${req.user.id}/${uuid()}.jpeg`;

        s3.getSignedUrl(
            "putObject",
            {
                Bucket: "my-blog-bucket-pd",
                ContentType: "image/jpeg",
                Key: key
            },
            (err, url) => {
                res.send({ key, url });
            }
        );
    });
};
