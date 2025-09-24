import { Container } from "inversify";
import { handlerRegistry, HANDLER_TYPES, featureHandler } from "../../../assets/scripts/handler-registry/handler-registry";
import { BaseHandlerImpl } from "../../../assets/scripts/features/base/base-handler";
import { BaseStoreImpl } from "../../../assets/scripts/features/base/base-store";

// Test handlers for testing
class TestStore extends BaseStoreImpl<Record<string, any>> {}

class TestHandler1 extends BaseHandlerImpl<Record<string, any>> {
    name = "testHandler1";
    readonly store = new TestStore();
}

class TestHandler2 extends BaseHandlerImpl<Record<string, any>> {
    name = "testHandler2";
    readonly store = new TestStore();
}

describe("HandlerRegistry", () => {
    beforeEach(() => {
        // Clear the singleton handlerRegistry state before each test
        (handlerRegistry as any).handlers.length = 0;
    });

    describe("register", () => {
        it("should add handler to internal handlers array", () => {
            // Arrange

            // Act
            handlerRegistry.register(TestHandler1);

            // Assert
            expect(handlerRegistry.getAll()).toHaveLength(1);
            expect(handlerRegistry.getAll()[0]).toBe(TestHandler1);
        });

        it("should add multiple handlers to internal handlers array", () => {
            // Arrange

            // Act
            handlerRegistry.register(TestHandler1);
            handlerRegistry.register(TestHandler2);

            // Assert
            expect(handlerRegistry.getAll()).toHaveLength(2);
            expect(handlerRegistry.getAll()).toContain(TestHandler1);
            expect(handlerRegistry.getAll()).toContain(TestHandler2);
        });

        it("should allow registering the same handler multiple times", () => {
            // Arrange

            // Act
            handlerRegistry.register(TestHandler1);
            handlerRegistry.register(TestHandler1);

            // Assert
            expect(handlerRegistry.getAll()).toHaveLength(2);
            expect(handlerRegistry.getAll()[0]).toBe(TestHandler1);
            expect(handlerRegistry.getAll()[1]).toBe(TestHandler1);
        });
    });

    describe("bindAll", () => {
        it("should bind all registered handlers to container", () => {
            // Arrange
            const mockContainer = {
                bind: jest.fn().mockReturnValue({
                    to: jest.fn()
                })
            } as unknown as Container;
            handlerRegistry.register(TestHandler1);
            handlerRegistry.register(TestHandler2);

            // Act
            handlerRegistry.bindAll(mockContainer);

            // Assert
            expect(mockContainer.bind).toHaveBeenCalledTimes(2);
            expect(mockContainer.bind).toHaveBeenCalledWith(HANDLER_TYPES);
        });

        it("should call to() method for each handler binding", () => {
            // Arrange
            const mockTo = jest.fn();
            const mockContainer = {
                bind: jest.fn().mockReturnValue({
                    to: mockTo
                })
            } as unknown as Container;
            handlerRegistry.register(TestHandler1);
            handlerRegistry.register(TestHandler2);

            // Act
            handlerRegistry.bindAll(mockContainer);

            // Assert
            expect(mockTo).toHaveBeenCalledTimes(2);
            expect(mockTo).toHaveBeenCalledWith(TestHandler1);
            expect(mockTo).toHaveBeenCalledWith(TestHandler2);
        });

        it("should not bind anything when no handlers are registered", () => {
            // Arrange
            const mockContainer = {
                bind: jest.fn().mockReturnValue({
                    to: jest.fn()
                })
            } as unknown as Container;

            // Act
            handlerRegistry.bindAll(mockContainer);

            // Assert
            expect(mockContainer.bind).not.toHaveBeenCalled();
        });
    });

    describe("getAll", () => {
        it("should return empty array when no handlers are registered", () => {
            // Arrange

            // Act
            const result = handlerRegistry.getAll();

            // Assert
            expect(result).toEqual([]);
        });

        it("should return copy of handlers array", () => {
            // Arrange
            handlerRegistry.register(TestHandler1);
            handlerRegistry.register(TestHandler2);

            // Act
            const result = handlerRegistry.getAll();

            // Assert
            expect(result).toHaveLength(2);
            expect(result).toContain(TestHandler1);
            expect(result).toContain(TestHandler2);
        });

        it("should return a new array instance (not reference to internal array)", () => {
            // Arrange
            handlerRegistry.register(TestHandler1);
            const firstCall = handlerRegistry.getAll();
            const secondCall = handlerRegistry.getAll();

            // Act
            firstCall.push(TestHandler2);

            // Assert
            expect(secondCall).toHaveLength(1);
            expect(handlerRegistry.getAll()).toHaveLength(1);
        });
    });

    describe("featureHandler decorator", () => {
        it("should register handler and return the same constructor", () => {
            // Arrange
            const originalRegistry = require("../../../assets/scripts/handler-registry/handler-registry").handlerRegistry;
            const registerSpy = jest.spyOn(originalRegistry, 'register');

            // Act
            const result = featureHandler(TestHandler1);

            // Assert
            expect(registerSpy).toHaveBeenCalledWith(TestHandler1);
            expect(result).toBe(TestHandler1);

            registerSpy.mockRestore();
        });

        it("should work as class decorator", () => {
            // Arrange
            const originalRegistry = require("../../../assets/scripts/handler-registry/handler-registry").handlerRegistry;
            const registerSpy = jest.spyOn(originalRegistry, 'register');

            // Act
            @featureHandler
            class DecoratedHandler extends BaseHandlerImpl<Record<string, any>> {
                name = "decoratedHandler";
                readonly store = new TestStore();
            }

            // Assert
            expect(registerSpy).toHaveBeenCalledWith(DecoratedHandler);
            const instance = new DecoratedHandler();
            expect(instance.name).toBe("decoratedHandler");

            registerSpy.mockRestore();
        });
    });
});
