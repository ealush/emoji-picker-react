export default function isFirefoxOnMac() {

    if (typeof navigator === 'undefined') {
        return;
    }

    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
        isMac = navigator.platform.indexOf('Mac') > -1;

    return isFirefox && isMac;
}
