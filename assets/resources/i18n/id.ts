const win = window || {} as any;
export const languages = {
    "Common": {
        "1st_half": "1st Half",
        "2nd_half": "2nd Half",
        "clb_atm": "Atheist de Madrid",
        "clb_boc": "Boca Warriors",
        "clb_bvb": "Borussia Dog Munch",
        "clb_che": "Chelsee",
        "clb_fcb": "Baya Munich",
        "clb_fla": "Flamenco",
        "clb_int": "Enter Milan",
        "clb_juv": "Javentus",
        "clb_mci": "Manchester Caliber",
        "clb_mty": "Montaray",
        "clb_pal": "Palmaris",
        "clb_por": "Porta FC",
        "clb_psg": "Paris X Germain",
        "clb_riv": "Rio Plata",
        "clb_rma": "Unreal Madrid",
        "clb_slb": "Sporting Benfica",
        "draw": "Draw",
        "fulltime": "FULL TIME",
        "halftime": "HALFTIME"
    }
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["id"] = languages;