const AWS = require('aws-sdk'),
    fs = require('fs'),
    telegram = require('telegram-bot-api');

const backupPath = process.argv[2],
    backupName = process.argv[3],
    client = process.argv[4];

let api = new telegram({
    token: `TELEGRAM_TOKEN`,
    updates: {
        enabled: true
    }
});

const endpoint = new AWS.Endpoint('storage.yandexcloud.net')
const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: "ИДЕНТИФИКАТОР_КЛЮЧА",
    secretAccessKey: "СЕКРЕТНЫЙ_КЛЮЧ",
    region: 'us-east-1',
    httpOptions: {
        timeout: 10000,
        connectTimeout: 10000
    }
})

const sendTelegram = (info) => {
    api.sendMessage({
            chat_id: ID_TELEGRAM_ЧАТА,
            text: info
        })
        .then((data) => {
            process.exit(0);
        })
        .catch((err) => {
            process.exit(1);
        });
}

const deleteBackUpFile = (pathAndFile, data) => {
    fs.unlink(`${pathAndFile}`, (err) => {
        if (err && err.code == 'ENOENT') {
            sendTelegram(`‼️ The backup file is missing or the client's path is specified incorrectly ${client} !! ${err}`)
        } else if (err) {
            sendTelegram(`‼️ Error deleting the backup file from the client ${client} !! ${err}`)
        } else {
            sendTelegram(`✅ Backup uploaded and delete successfully. ${data.Location}`)
        }
    });

}

const uploadFile = (pathAndFile) => {
    let now = new Date(),
        year = now.getFullYear(),
        month = ("0" + (now.getMonth() + 1)).slice(-2),
        hours = now.getHours(),
        minutes = now.getMinutes(),
        seconds = now.getSeconds();

    const params = {
        Bucket: "BUCKET_NAME",
        Key: `${client}/${year}-${month}-${hours}-${minutes}-${seconds}-${backupName}`,
        Body: fs.createReadStream(`${pathAndFile}`)
    };

    s3.upload(params, (err, data) => {
        if (err) {
            sendTelegram(`‼️ ${err}`);
        }
        deleteBackUpFile(pathAndFile, data);
    });
}

const start = () => {
    const pathAndFile = `${backupPath}/${backupName}`
    try {
        if (fs.statSync(pathAndFile)) {
            uploadFile(pathAndFile);
        }
    } catch (err) {
        sendTelegram(`‼️ The backup file is missing or the client's path is specified incorrectly ${client} !! ${err}`)
    }
}
start();