const win = window || {} as any;
export const languages = {
    "common": {
        "1st_half": "上半场",
        "2nd_half": "下半场",
        "clb_ars": "阿森纳",
        "clb_atm": "Atheist de Madrid",
        "clb_bar": "巴塞隆拿",
        "clb_ben": "Sporting Benfica",
        "clb_boj": "Boca Warriors",
        "clb_bvb": "Borussia Dog Munch",
        "clb_che": "切尔西",
        "clb_fcb": "拜仁慕尼黑 ",
        "clb_fla": "Flamenco",
        "clb_int": "国际米兰",
        "clb_juv": "Javentus",
        "clb_liv": "利物浦",
        "clb_mci": "曼城",
        "clb_mon": "Montaray",
        "clb_pal": "Palmaris",
        "clb_por": "Porta FC",
        "clb_psg": "Paris X Germain",
        "clb_riv": "Rio Plata",
        "clb_rma": "皇家马德里",
        "draw": "Draw",
        "fulltime": "FULL TIME",
        "halftime": "半场休息",
        "nt_arg": "阿根廷",
        "nt_bra": "巴西",
        "nt_eng": "英格兰",
        "nt_esp": "西班牙",
        "nt_fra": "法国",
        "nt_ger": "德国",
        "nt_ned": "荷兰",
        "nt_por": "葡萄牙"
    },
    "testing": {
        "clb_atm": "ATM"
    },
    "vgaming": {
        "clb_ars": "阿森纳",
        "clb_bar": "巴塞罗那",
        "clb_che": "切尔西",
        "clb_fcb": "拜仁慕尼黑",
        "clb_int": "国际米兰",
        "clb_liv": "利物浦",
        "clb_mci": "曼城",
        "clb_rma": "皇家马德里"
    }
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["zh-CN"] = languages;