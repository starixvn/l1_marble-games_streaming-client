import { Container } from "inversify";
import {
  store,
  Stores,
  handleWindowMessage,
} from "../../assets/scripts/store-decorator";

// Test store classes
class TestStore {
  public name: string = "initial";
  public value: number = 0;
  public data: any = null;

  updateName(newName: string) {
    this.name = newName;
  }

  updateValue(newValue: number) {
    this.value = newValue;
  }
}

class AnotherTestStore {
  public id: string = "default";
  public active: boolean = false;
}

// Mock DOM elements
const mockGameCanvas = {
  dispatchEvent: jest.fn(),
  id: "GameCanvas",
};

Object.defineProperty(document, "getElementById", {
  value: jest.fn().mockImplementation((id: string) => {
    if (id === "GameCanvas") {
      return mockGameCanvas;
    }
    return null;
  }),
  writable: true,
});

// Mock MouseEvent constructor
Object.defineProperty(global, "MouseEvent", {
  value: jest.fn().mockImplementation((type: string, options: any) => ({
    type,
    ...options,
  })),
  writable: true,
});

describe("store-decorator", () => {
  let container: Container;
  let testStoreInstance: TestStore;
  let anotherStoreInstance: AnotherTestStore;

  beforeEach(() => {
    // Clear the stores map before each test
    Stores.clear();

    // Reset DOM mocks
    mockGameCanvas.dispatchEvent.mockClear();
    (document.getElementById as jest.Mock).mockClear();
    (global.MouseEvent as jest.Mock).mockClear();

    // Setup container
    container = new Container();

    // Create test store instances
    testStoreInstance = new TestStore();
    anotherStoreInstance = new AnotherTestStore();

    // Bind stores to container
    container.bind(TestStore).toConstantValue(testStoreInstance);
    container.bind(AnotherTestStore).toConstantValue(anotherStoreInstance);

    // Spy on container.get method
    jest.spyOn(container, "get");
  });

  afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("@store decorator", () => {
    it("should register a store with the given name", () => {
      // Condition: Apply @store decorator to a class
      const DecoratedStore = store("testStore")(TestStore);

      // Expectation: Store should be registered in Stores map
      expect(Stores.has("testStore")).toBe(true);
      expect(Stores.get("testStore")).toBe(TestStore);
      expect(DecoratedStore).toBe(TestStore); // Should return the original constructor
    });

    it("should allow multiple stores to be registered with different names", () => {
      // Condition: Register multiple stores with different names
      store("store1")(TestStore);
      store("store2")(AnotherTestStore);

      // Expectation: Both stores should be registered
      expect(Stores.has("store1")).toBe(true);
      expect(Stores.has("store2")).toBe(true);
      expect(Stores.get("store1")).toBe(TestStore);
      expect(Stores.get("store2")).toBe(AnotherTestStore);
      expect(Stores.size).toBe(2);
    });

    it("should overwrite previous registration if same name is used", () => {
      // Condition: Register two different stores with the same name
      store("sameName")(TestStore);
      store("sameName")(AnotherTestStore);

      // Expectation: Last registration should overwrite the first
      expect(Stores.has("sameName")).toBe(true);
      expect(Stores.get("sameName")).toBe(AnotherTestStore);
      expect(Stores.size).toBe(1);
    });

    it("should work with empty string as store name", () => {
      // Condition: Register store with empty string name
      store("")(TestStore);

      // Expectation: Store should be registered with empty string key
      expect(Stores.has("")).toBe(true);
      expect(Stores.get("")).toBe(TestStore);
    });
  });

  describe("handleWindowMessage", () => {
    let messageHandler: (event: MessageEvent) => void;

    beforeEach(() => {
      // Register test stores
      store("testStore")(TestStore);
      store("anotherStore")(AnotherTestStore);

      messageHandler = handleWindowMessage(container);
    });

    describe("message validation", () => {
      it("should ignore non-array messages", () => {
        // Condition: Send non-array message data
        const event = { data: "not an array" } as MessageEvent;

        // Expectation: Handler should return early without processing
        expect(() => messageHandler(event)).not.toThrow();
        expect(container.get).not.toHaveBeenCalled();
      });

      it("should ignore arrays with wrong length", () => {
        // Condition: Send array with length other than 2
        const shortArray = { data: ["single"] } as MessageEvent;
        const longArray = { data: ["one", "two", "three"] } as MessageEvent;

        // Expectation: Both should be ignored
        expect(() => messageHandler(shortArray)).not.toThrow();
        expect(() => messageHandler(longArray)).not.toThrow();
        expect(container.get).not.toHaveBeenCalled();
      });

      it("should ignore messages where first element is not a string", () => {
        // Condition: Send array where first element is not string
        const event = { data: [123, { prop: "value" }] } as MessageEvent;

        // Expectation: Should be ignored
        expect(() => messageHandler(event)).not.toThrow();
        expect(container.get).not.toHaveBeenCalled();
      });

      it("should ignore messages where second element is not an object", () => {
        // Condition: Send array where second element is not object
        const stringSecond = {
          data: ["storeName", "not an object"],
        } as MessageEvent;
        const numberSecond = { data: ["storeName", 42] } as MessageEvent;
        const nullSecond = { data: ["storeName", null] } as MessageEvent;

        // Expectation: All should be ignored
        expect(() => messageHandler(stringSecond)).not.toThrow();
        expect(() => messageHandler(numberSecond)).not.toThrow();
        expect(() => messageHandler(nullSecond)).not.toThrow();
        expect(container.get).not.toHaveBeenCalled();
      });

      it("should accept valid message format", () => {
        // Condition: Send properly formatted message
        const event = {
          data: ["testStore", { name: "updated" }],
        } as MessageEvent;

        // Expectation: Should not throw and should process
        expect(() => messageHandler(event)).not.toThrow();
      });
    });

    describe("store message handling", () => {
      it("should update store instance when valid store message is received", () => {
        // Condition: Send valid message for registered store
        const updateData = { name: "updated name", value: 42 };
        const event = {
          data: ["testStore", updateData],
        } as MessageEvent;

        // Expectation: Store instance should be updated with new values
        messageHandler(event);

        expect(testStoreInstance.name).toBe("updated name");
        expect(testStoreInstance.value).toBe(42);
      });

      it("should handle partial updates to store", () => {
        // Condition: Send message with only some properties
        const originalName = testStoreInstance.name;
        const updateData = { value: 99 };
        const event = {
          data: ["testStore", updateData],
        } as MessageEvent;

        // Expectation: Only specified properties should be updated
        messageHandler(event);

        expect(testStoreInstance.name).toBe(originalName); // unchanged
        expect(testStoreInstance.value).toBe(99); // updated
      });

      it("should ignore messages for unregistered stores", () => {
        // Condition: Send message for store that wasn't registered
        const event = {
          data: ["unknownStore", { someProperty: "value" }],
        } as MessageEvent;

        // Expectation: Should not throw and should not affect any stores
        expect(() => messageHandler(event)).not.toThrow();
        expect(testStoreInstance.name).toBe("initial"); // unchanged
        expect(anotherStoreInstance.id).toBe("default"); // unchanged
      });

      it("should handle multiple different store updates", () => {
        // Condition: Send updates for different stores
        const testStoreUpdate = {
          data: ["testStore", { name: "test updated" }],
        } as MessageEvent;
        const anotherStoreUpdate = {
          data: ["anotherStore", { id: "new id", active: true }],
        } as MessageEvent;

        // Expectation: Both stores should be updated correctly
        messageHandler(testStoreUpdate);
        messageHandler(anotherStoreUpdate);

        expect(testStoreInstance.name).toBe("test updated");
        expect(anotherStoreInstance.id).toBe("new id");
        expect(anotherStoreInstance.active).toBe(true);
      });

      it("should handle null values in update data", () => {
        // Condition: Send message with null values
        const updateData = { name: null, data: null };
        const event = {
          data: ["testStore", updateData],
        } as MessageEvent;

        // Expectation: Store should accept null values
        messageHandler(event);

        expect(testStoreInstance.name).toBe(null);
        expect(testStoreInstance.data).toBe(null);
      });

      it("should handle nested object updates", () => {
        // Condition: Send message with nested object data
        const complexData = {
          data: {
            nested: {
              property: "value",
            },
            array: [1, 2, 3],
          },
        };
        const event = {
          data: ["testStore", complexData],
        } as MessageEvent;

        // Expectation: Store should receive the complex object
        messageHandler(event);

        expect(testStoreInstance.data).toEqual({
          nested: {
            property: "value",
          },
          array: [1, 2, 3],
        });
      });
    });

    describe("error handling", () => {
      it("should handle case when container.get returns null", () => {
        // Condition: Container returns null for registered store
        const mockContainer = {
          get: jest.fn().mockReturnValue(null),
        } as any;
        const handler = handleWindowMessage(mockContainer);
        const event = {
          data: ["testStore", { name: "update" }],
        } as MessageEvent;

        // Expectation: Should not throw error
        expect(() => handler(event)).not.toThrow();
        expect(mockContainer.get).toHaveBeenCalledWith(TestStore);
      });

      it("should handle case when Stores.get returns undefined", () => {
        // Condition: Store is registered but Stores.get returns undefined
        Stores.set("testStore", undefined as any);
        const event = {
          data: ["testStore", { name: "update" }],
        } as MessageEvent;

        // Expectation: Should return early without calling container
        messageHandler(event);

        // The container.get should not be called since store is undefined
        expect(container.get).not.toHaveBeenCalled();
      });
    });
  });
});
