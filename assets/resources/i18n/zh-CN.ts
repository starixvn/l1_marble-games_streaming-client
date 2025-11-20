const win = window || {} as any;
export const languages = {
    "Common": {
        "1st_half": "1st Half",
        "2nd_half": "2nd Half",
        "clb_ars": "Arsenal",
        "clb_atm": "Atheist de Madrid",
        "clb_bar": "Barcelona",
        "clb_ben": "Sporting Benfica",
        "clb_boj": "Boca Warriors",
        "clb_bvb": "Borussia Dog Munch",
        "clb_che": "Chelsee",
        "clb_fcb": "Baya Munich",
        "clb_fla": "Flamenco",
        "clb_int": "Enter Milan",
        "clb_juv": "Javentus",
        "clb_liv": "Liverpool",
        "clb_mci": "Manchester Caliber",
        "clb_mon": "Montaray",
        "clb_pal": "Palmaris",
        "clb_por": "Porta FC",
        "clb_psg": "Paris X Germain",
        "clb_riv": "Rio Plata",
        "clb_rma": "Unreal Madrid",
        "draw": "Draw",
        "fulltime": "FULL TIME",
        "halftime": "HALFTIME",
        "nt_arg": "Argentina",
        "nt_bra": "Brazil",
        "nt_eng": "England",
        "nt_esp": "Spain",
        "nt_fra": "France",
        "nt_ger": "Germany",
        "nt_ned": "Netherlands",
        "nt_por": "Portugal"
    },
    "testing": {
        "clb_atm": "ATM"
    }
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["zh-CN"] = languages;