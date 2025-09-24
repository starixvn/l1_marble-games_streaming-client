import { BaseStoreImpl } from "../../../../assets/scripts/features/base/base-store";

// Concrete test implementation
class TestStore extends BaseStoreImpl<string> {}

describe("BaseStoreImpl", () => {
    describe("constructor", () => {
        it("should initialize data as null", () => {
            // Arrange & Act
            const store = new TestStore();

            // Assert
            expect(store.data).toBeNull();
        });
    });

    describe("update", () => {
        it("should update data with provided value", () => {
            // Arrange
            const store = new TestStore();
            const testData = "test value";

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toBe(testData);
        });

        it("should update data with complex object", () => {
            // Arrange
            class ComplexTestStore extends BaseStoreImpl<{ id: number; value: string }> {}
            const store = new ComplexTestStore();
            const testData = { id: 1, value: "complex test" };

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });

        it("should overwrite previous data", () => {
            // Arrange
            const store = new TestStore();
            const firstData = "first value";
            const secondData = "second value";
            store.data = firstData;

            // Act
            store.update(secondData);

            // Assert
            expect(store.data).toBe(secondData);
        });

        it("should update data with array", () => {
            // Arrange
            class ArrayTestStore extends BaseStoreImpl<string[]> {}
            const store = new ArrayTestStore();
            const testData = ["item1", "item2", "item3"];

            // Act
            store.update(testData);

            // Assert
            expect(store.data).toEqual(testData);
        });
    });
});
