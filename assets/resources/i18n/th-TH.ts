const win = window || {} as any;
export const languages = {
    "Common": {
        "1st_half": "1st Half",
        "2nd_half": "2nd Half",
        "clb_ars": "อาร์เซนอล",
        "clb_atm": "Atheist de Madrid",
        "clb_bar": "บาร์เซโลนา",
        "clb_ben": "Sporting Benfica",
        "clb_boj": "Boca Warriors",
        "clb_bvb": "Borussia Dog Munch",
        "clb_che": "เชลซี",
        "clb_fcb": "บาเยิร์น มิวนิก",
        "clb_fla": "Flamenco",
        "clb_int": "อินเตอร์ มิลาน",
        "clb_juv": "Javentus",
        "clb_liv": "ลิเวอร์พูล",
        "clb_mci": "แมนเชสเตอร์ ซิตี้",
        "clb_mon": "Montaray",
        "clb_pal": "Palmaris",
        "clb_por": "Porta FC",
        "clb_psg": "Paris X Germain",
        "clb_riv": "Rio Plata",
        "clb_rma": "เรอัล มาดริด",
        "draw": "Draw",
        "fulltime": "FULL TIME",
        "halftime": "HALFTIME",
        "nt_arg": "อาร์เจนตินา",
        "nt_bra": "บราซิล",
        "nt_eng": "อังกฤษ",
        "nt_esp": "สเปน",
        "nt_fra": "ฝรั่งเศส",
        "nt_ger": "เยอรมนี",
        "nt_ned": "เนเธอร์แลนด์",
        "nt_por": "โปรตุเกส"
    },
    "testing": {
        "clb_atm": "ATM"
    },
    "Vgaming": {
        "clb_ars": "อาร์เซนอล",
        "clb_bar": "บาร์เซโลนา",
        "clb_che": "เชลซี",
        "clb_fcb": "บาเยิร์น มิวนิก",
        "clb_int": "อินเตอร์ มิลาน",
        "clb_liv": "ลิเวอร์พูล",
        "clb_mci": "แมนเชสเตอร์ ซิตี้",
        "clb_rma": "เรอัล มาดริด"
    }
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["th-TH"] = languages;