const win = window || {} as any;
export const languages = {
    "Common": {
        "1st_half": "1st Half",
        "2nd_half": "2nd Half",
        "clb_ars": "阿仙奴",
        "clb_atm": "Atheist de Madrid",
        "clb_bar": "巴塞隆拿",
        "clb_ben": "Sporting Benfica",
        "clb_boj": "Boca Warriors",
        "clb_bvb": "Borussia Dog Munch",
        "clb_che": "車路士",
        "clb_fcb": "拜仁慕尼黑",
        "clb_fla": "Flamenco",
        "clb_int": "國際米蘭",
        "clb_juv": "Javentus",
        "clb_liv": "利物浦",
        "clb_mci": "曼城 ",
        "clb_mon": "Montaray",
        "clb_pal": "Palmaris",
        "clb_por": "Porta FC",
        "clb_psg": "Paris X Germain",
        "clb_riv": "Rio Plata",
        "clb_rma": "皇家馬德里",
        "draw": "Draw",
        "fulltime": "FULL TIME",
        "halftime": "HALFTIME",
        "nt_arg": "阿根廷",
        "nt_bra": "巴西",
        "nt_eng": "英格蘭",
        "nt_esp": "西班牙",
        "nt_fra": "法國",
        "nt_ger": "德國",
        "nt_ned": "荷蘭",
        "nt_por": "葡萄牙"
    },
    "testing": {
        "clb_atm": "ATM"
    },
    "Vgaming": {
        "clb_ars": "阿仙奴",
        "clb_bar": "巴塞隆拿",
        "clb_che": "車路士",
        "clb_fcb": "拜仁慕尼黑",
        "clb_int": "國際米蘭",
        "clb_liv": "利物浦",
        "clb_mci": "曼城 ",
        "clb_rma": "皇家馬德里"
    }
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["zh-TW"] = languages;