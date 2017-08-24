const CDP = require('chrome-remote-interface');

async function sleep(delay) {
  return new Promise((ok, fail) => {
    setTimeout(ok, delay * 1000);
  });
}

CDP(async(client) => {
    const {Network, Page, Runtime} = client;
    try {
        await Network.enable();
        await Page.enable();
        await Runtime.enable();
        await Network.setCacheDisabled({cacheDisabled: true});
        await Page.navigate({url: 'https://example.com' + slug});
        await Page.loadEventFired();
        let result;
        let retryTimes = 0;
        while (true) {
            result = await Runtime.evaluate({
                expression: "document.querySelector('iframe[src^=\"https://\"]').contentDocument.body.querySelector('iframe[src^=\"https://\"').contentDocument.body.querySelector('.video').src"
            });
            if (result.result.value !== undefined) {
                console.log(result.result.value);
                break;
            }
            retryTimes++;
            console.log("Retry ...", retryTimes)
            await sleep(5);
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}).on('error', (err) => {
    console.error(err);
});