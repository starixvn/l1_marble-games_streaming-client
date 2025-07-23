const win = window || {} as any;
export const languages = {
    "Common": {
        "halftime": "HALFTIME"
    }
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["zh-Hant-TW"] = languages;