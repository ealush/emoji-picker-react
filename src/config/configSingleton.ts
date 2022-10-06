const ConfigSingleton = {
    _cdnHost: "",
    _emojiFormat: "",

    cdnHost() : string {
        if (!this._cdnHost){
            this._cdnHost = "https://cdn.jsdelivr.net";
        }
        return this._cdnHost;
    },

    emojiFormat() : string {
        if (!this._emojiFormat) {
          this._emojiFormat = "png";
        }
        return this._emojiFormat;
      },
    setCDNHost(host: string) {
        this._cdnHost = host;
    },


    setEmojiFormat(format: string) {
        this._emojiFormat = format
    },
}

export default ConfigSingleton;