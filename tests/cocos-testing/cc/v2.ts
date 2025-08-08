export const v2 = jest.fn();

export class Vec2 {
    static ZERO = 0;
    static ONE = 1;

    x? = 0;
    y? = 0;

    clone = jest.fn();
}
