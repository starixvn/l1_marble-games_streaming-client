jest.mock("mobx", () => {
    const realMobx = jest.requireActual("mobx");
    return {
        ...realMobx,
        makeAutoObservable: jest.fn(realMobx.makeAutoObservable),
        runInAction: jest.fn(realMobx.runInAction),
    };
});
