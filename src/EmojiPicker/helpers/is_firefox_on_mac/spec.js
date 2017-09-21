import isFirefoxOnMac from './index';

describe('Test isFirefoxOnMac Function', () => {
    it('should correctly identify firefox on mac by user agent and platform', () => {
        const platforms = ['Android', 'Linux', 'iPhone', 'iPhone Simulator', 'Windows', 'PlayStation 4'],
            macPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
            agents = ['Mozilla/5.0 (Linux; Android 6.0.1; Nexus 6P Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.83 Mobile Safari/537.36', 'Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246', 'Mozilla/5.0 (X11; CrOS x86_64 8172.45.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.64 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'],
            ffAgents = ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:54.0) Gecko/20100101 Firefox/54.0', 'Mozilla/5.0 (Windows NT x.y; Win64; x64; rv:10.0) Gecko/20100101 Firefox/10.0'];

        global.navigator = {};

        platforms.concat(macPlatforms).forEach((platform) => {
            navigator.platform = platform;

            agents.concat(ffAgents).forEach((agent) => {
                navigator.userAgent = agent;

                const res = isFirefoxOnMac();

                if (macPlatforms.includes(platform) && ffAgents.includes(agent)) {
                    return expect(res).to.equal(true);
                }
                return expect(res).to.equal(false);
            });
        });
    });
});