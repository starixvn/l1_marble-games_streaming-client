import { BaseHandlerImpl } from "../../../../assets/scripts/features/base/base-handler";
import { BaseStoreImpl } from "../../../../assets/scripts/features/base/base-store";

// Concrete test implementations
class TestStore extends BaseStoreImpl<Record<string, any>> {}

class TestHandler extends BaseHandlerImpl<Record<string, any>> {
    name = "testHandler";
    readonly store = new TestStore();
}

describe("BaseHandlerImpl", () => {
    describe("handle", () => {
        it("should call update when data contains handler name property", () => {
            // Arrange
            const handler = new TestHandler();
            const updateSpy = jest.spyOn(handler, 'update');
            const testData = { testHandler: "test value" };

            // Act
            handler.handle(testData);

            // Assert
            expect(updateSpy).toHaveBeenCalledWith("test value");
        });

        it("should not call update when data does not contain handler name property", () => {
            // Arrange
            const handler = new TestHandler();
            const updateSpy = jest.spyOn(handler, 'update');
            const testData = { otherProperty: "test value" };

            // Act
            handler.handle(testData);

            // Assert
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it("should not call update when handler name property is falsy", () => {
            // Arrange
            const handler = new TestHandler();
            const updateSpy = jest.spyOn(handler, 'update');
            const testData = { testHandler: null };

            // Act
            handler.handle(testData);

            // Assert
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it("should not call update when handler name property is undefined", () => {
            // Arrange
            const handler = new TestHandler();
            const updateSpy = jest.spyOn(handler, 'update');
            const testData = { testHandler: undefined };

            // Act
            handler.handle(testData);

            // Assert
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it("should not call update when handler name property is empty string", () => {
            // Arrange
            const handler = new TestHandler();
            const updateSpy = jest.spyOn(handler, 'update');
            const testData = { testHandler: "" };

            // Act
            handler.handle(testData);

            // Assert
            expect(updateSpy).not.toHaveBeenCalled();
        });

        it("should not call update when handler name property is zero", () => {
            // Arrange
            const handler = new TestHandler();
            const updateSpy = jest.spyOn(handler, 'update');
            const testData = { testHandler: 0 };

            // Act
            handler.handle(testData);

            // Assert
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("should call store.update with provided data", () => {
            // Arrange
            const handler = new TestHandler();
            const storeUpdateSpy = jest.spyOn(handler.store, 'update');
            const testData = { key: "test data" };

            // Act
            handler.update(testData);

            // Assert
            expect(storeUpdateSpy).toHaveBeenCalledWith(testData);
        });

        it("should call store.update with complex object data", () => {
            // Arrange
            class ComplexTestStore extends BaseStoreImpl<Record<string, any>> {}
            class ComplexTestHandler extends BaseHandlerImpl<Record<string, any>> {
                name = "complexHandler";
                readonly store = new ComplexTestStore();
            }
            const handler = new ComplexTestHandler();
            const storeUpdateSpy = jest.spyOn(handler.store, 'update');
            const testData = { id: 1, value: "complex test" };

            // Act
            handler.update(testData);

            // Assert
            expect(storeUpdateSpy).toHaveBeenCalledWith(testData);
        });
    });
});