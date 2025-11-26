const win = window || {} as any;
export const languages = {
    "common": {
        "1st_half": "Hiệp 1",
        "2nd_half": "Hiệp 2",
        "clb_ars": "Arsenal",
        "clb_atm": "Atheist de Madrid",
        "clb_bar": "Barcelona",
        "clb_ben": "Sporting Benfica",
        "clb_boj": "Boca Warriors",
        "clb_bvb": "Borussia Dog Munch",
        "clb_che": "Chelsea",
        "clb_fcb": "Bayern Munchen",
        "clb_fla": "Flamenco",
        "clb_int": "Inter Milan",
        "clb_juv": "Javentus",
        "clb_liv": "Liverpool",
        "clb_mci": "Manchester City",
        "clb_mon": "Montaray",
        "clb_pal": "Palmaris",
        "clb_por": "Porta FC",
        "clb_psg": "Paris X Germain",
        "clb_riv": "Rio Plata",
        "clb_rma": "Real Madrid",
        "draw": "Draw",
        "fulltime": "TOÀN TRẬN",
        "halftime": "Hết Hiệp 1",
        "nt_arg": "Argentina",
        "nt_bra": "Brazil",
        "nt_eng": "Anh",
        "nt_esp": "Tây Ban Nha",
        "nt_fra": "Pháp",
        "nt_ger": "Đức",
        "nt_ned": "Hà Lan",
        "nt_por": "Bồ Đào Nha"
    },
    "testing": {
        "clb_atm": "ATM"
    },
    "vgaming": {
        "clb_ars": "Arsonist",
        "clb_bar": "FC Barna",
        "clb_che": "Chelsee",
        "clb_fcb": "Baya Munich",
        "clb_int": "Enter Milan",
        "clb_liv": "Livenpool",
        "clb_mci": "Manchester Caliber",
        "clb_rma": "Unreal Madrid"
    }
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["vi-VN"] = languages;