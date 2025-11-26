const win = window || {} as any;
export const languages = {
    "common": {
        "1st_half": "Paruh Pertama",
        "2nd_half": "Paruh Kedua",
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
        "fulltime": "FULL TIME",
        "halftime": "Paruh Waktu",
        "nt_arg": "Argentina",
        "nt_bra": "Brasil",
        "nt_eng": "Inggris",
        "nt_esp": "Spanyol",
        "nt_fra": "Prancis",
        "nt_ger": "Jerman",
        "nt_ned": "Belanda",
        "nt_por": "Portugal"
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
                          
win.languages["id-ID"] = languages;