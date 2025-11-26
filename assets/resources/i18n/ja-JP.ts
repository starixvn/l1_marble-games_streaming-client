const win = window || {} as any;
export const languages = {
    "common": {
        "1st_half": "前半",
        "2nd_half": "後半",
        "clb_ars": "アーセナル",
        "clb_atm": "Atheist de Madrid",
        "clb_bar": "バルセロナ",
        "clb_ben": "Sporting Benfica",
        "clb_boj": "Boca Warriors",
        "clb_bvb": "Borussia Dog Munch",
        "clb_che": "チェルシー",
        "clb_fcb": "バイエルン・ミュンヘン",
        "clb_fla": "Flamenco",
        "clb_int": "インターミラン",
        "clb_juv": "Javentus",
        "clb_liv": "リバプール",
        "clb_mci": "マンチェスター・シティ",
        "clb_mon": "Montaray",
        "clb_pal": "Palmaris",
        "clb_por": "Porta FC",
        "clb_psg": "Paris X Germain",
        "clb_riv": "Rio Plata",
        "clb_rma": "レアル・マドリッド",
        "draw": "Draw",
        "fulltime": "フルタイム",
        "halftime": "ハーフタイム",
        "nt_arg": "アルゼンチン",
        "nt_bra": "ブラジル",
        "nt_eng": "イングランド",
        "nt_esp": "スペイン",
        "nt_fra": "フランス",
        "nt_ger": "ドイツ",
        "nt_ned": "オランダ",
        "nt_por": "ポルトガル"
    },
    "testing": {
        "clb_atm": "ATM"
    },
    "vgaming": {
        "clb_ars": "アーセナル",
        "clb_bar": "バルセロナ",
        "clb_che": "チェルシー",
        "clb_fcb": "バイエルン・ミュンヘン",
        "clb_int": "インターミラン",
        "clb_liv": "リバプール",
        "clb_mci": "マンチェスター・シティ",
        "clb_rma": "レアル・マドリッド"
    }
};

if (!win.languages) {
    win.languages = {};
}
                          
win.languages["ja-JP"] = languages;