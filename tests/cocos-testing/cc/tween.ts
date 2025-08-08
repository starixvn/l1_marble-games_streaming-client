export class Tween<T = any> {
    static stopAllByTarget = jest.fn().mockReturnThis();
    static stopAllByTag = jest.fn().mockReturnThis();

    stop = jest.fn();
}

export const tweenInstance = {
    sequence: jest.fn().mockReturnThis(),
    call: jest.fn().mockReturnThis(),
    delay: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    by: jest.fn().mockReturnThis(),
    start: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    repeatForever: jest.fn().mockReturnThis(),
    destroySelf: jest.fn().mockReturnThis(),
};

export const tween = jest.fn().mockReturnValue(tweenInstance);

export type TweenEasing =
    | "linear"
    | "smooth"
    | "fade"
    | "constant"
    | "quadIn"
    | "quadOut"
    | "quadInOut"
    | "quadOutIn"
    | "cubicIn"
    | "cubicOut"
    | "cubicInOut"
    | "cubicOutIn"
    | "quartIn"
    | "quartOut"
    | "quartInOut"
    | "quartOutIn"
    | "quintIn"
    | "quintOut"
    | "quintInOut"
    | "quintOutIn"
    | "sineIn"
    | "sineOut"
    | "sineInOut"
    | "sineOutIn"
    | "expoIn"
    | "expoOut"
    | "expoInOut"
    | "expoOutIn"
    | "circIn"
    | "circOut"
    | "circInOut"
    | "circOutIn"
    | "elasticIn"
    | "elasticOut"
    | "elasticInOut"
    | "elasticOutIn"
    | "backIn"
    | "backOut"
    | "backInOut"
    | "backOutIn"
    | "bounceIn"
    | "bounceOut"
    | "bounceInOut"
    | "bounceOutIn";
