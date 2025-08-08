export const find = jest.fn().mockImplementation(() => ({
    getComponent: jest.fn().mockReturnValue({
        namespace: "mockedNamespace",
    }),
    getComponentInChildren: jest.fn().mockReturnValue({
        namespace: "mockedNamespace",
    }),
    getComponentsInChildren: jest.fn().mockReturnValue([
        {
            namespace: "mockedNamespace",
        },
    ]),
    getChildByName: jest.fn().mockReturnValue({
        namespace: "mockedNamespace",
    }),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    uuid: "mock-node-uuid",
}));
