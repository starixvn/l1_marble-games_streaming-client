const win = window || {} as any;
export const languages = {
    "Common": {},
    "testing": {}
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["zh-TW"] = languages;