const win = window || {} as any;
export const languages = {
    "Common": {
        "halftime": "GIỮA HIỆP"
    },
    "testing": {}
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["vi-VN"] = languages;