export default function isFirefoxOnMac() {
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        isMac = navigator.platform.indexOf('Mac') > -1;

    return isFirefox && isMac;
}
