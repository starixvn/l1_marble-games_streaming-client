import "reflect-metadata"
import { BaseHandler } from "../../../assets/scripts/features/base/base-handler";
import { FeatureHandler } from "../../../assets/scripts/feature-handler/feature-handler";
import { Container } from "inversify";
import { HANDLER_TYPES } from "../../../assets/scripts/handler-registry";

describe("FeatureHandler", () => {
    let container: Container;
    let handler1: jest.Mocked<BaseHandler<any>>;
    let handler2: jest.Mocked<BaseHandler<any>>;

    beforeEach(() => {
        container = new Container();
        handler1 = {
            handle: jest.fn(),
        } as unknown as jest.Mocked<BaseHandler<any>>;
        handler2 = {
            handle: jest.fn(),
        } as unknown as jest.Mocked<BaseHandler<any>>;

        container.bind(HANDLER_TYPES).toConstantValue(handler1);
        container.bind(HANDLER_TYPES).toConstantValue(handler2);
        container.bind(FeatureHandler).toSelf();

    });

    describe("update", () => {
        it("should call handle on all handlers", () => {
            // Arrange
            const featureHandler = container.get(FeatureHandler);
            const data = {
                handler1: "data1",
                handler2: "data2",
            };

            // Act
            featureHandler.update(data);

            // Assert
            expect(handler1.handle).toHaveBeenCalledWith(data);
            expect(handler2.handle).toHaveBeenCalledWith(data);
        });
    });
});