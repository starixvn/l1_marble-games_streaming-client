import mobx from "mobx";
// NOSONAR
// @ts-ignore
// Storage for reaction disposers 
export const reactionDisposers: Array<() => void> = [];
// Mock container - globally accessible
// @ts-ignore
export let mockContainer: any;

export const mockRenderMetadata = new Map<any, Array<{ 
  methodName: string, 
  storeConstructor: any, 
  selector: (store: any) => any 
}>>();

export function initializeMockContainer() {
  // @ts-ignore
  mockContainer = {
    instances: new Map(),
    get: jest.fn().mockImplementation((constructor) => {
      if (!mockContainer.instances.has(constructor)) {
        throw new Error(`No instance found for ${constructor.name}`);
      }
      return mockContainer.instances.get(constructor);
    }),
    set: function(constructor: any, instance: any) {
      this.instances.set(constructor, instance);
    }
  };
  return mockContainer;
}

// Clean up function
export function cleanupMockObserver() {
  reactionDisposers.forEach(disposer => disposer());
  reactionDisposers.length = 0;
  mockRenderMetadata.clear();
  if (mockContainer) {
    mockContainer.instances.clear();
  }
}

export function createMockStore<T>(storeConstructor: new (...args: any[]) => T, initialProps: Partial<T>) {
  if (!mockContainer) {
    initializeMockContainer();
  }

  // Create a real instance to get the methods
  const realInstance = new storeConstructor();
  const mockStore = mobx.observable({ ...initialProps });
  
  // Copy methods from real instance to mock store
  Object.getOwnPropertyNames(Object.getPrototypeOf(realInstance)).forEach(name => {
    if (name !== 'constructor' && typeof realInstance[name] === 'function') {
      mockStore[name] = realInstance[name].bind(mockStore);
    }
  });
  
  mockContainer.set(storeConstructor, mockStore);
  
  return new Proxy(mockStore, {
    get(target, prop) {
      if (prop === 'update') {
        return (props: Partial<T>) => {
          mobx.runInAction(() => {
            Object.assign(target, props);
          });
        };
      }
      if (prop === 'reset') {
        return (props: Partial<T>) => {
          mobx.runInAction(() => {
            Object.assign(target, initialProps, props);
          });
        };
      }
      return target[prop as keyof typeof target];
    },
    set(target, prop, value) {
      target[prop as keyof T] = value;
      return true;
    }
  }) as unknown as T & { 
    update: (props: Partial<T>) => void;
    reset: (props: Partial<T>) => void;
  };
}

/**
 * Creates spies on store methods to track @handle decorator calls
 */
export function spyOnStoreMethods<T>(mockStore: T, methods: (keyof T)[]): Record<string, jest.SpyInstance> {
  const spies: Record<string, jest.SpyInstance> = {};
  
  methods.forEach(methodName => {
    const originalMethod = mockStore[methodName];
    if (typeof originalMethod === 'function') {
      spies[methodName as string] = jest.spyOn(mockStore as any, methodName as string);
    }
  });
  
  return spies;
}

/**
 * Helper to expect store method was called with specific arguments
 */
export function expectStoreMethodCalled<T>(
  spies: Record<string, jest.SpyInstance>, 
  methodName: keyof T, 
  ...args: any[]
) {
  expect(spies[methodName as string]).toHaveBeenCalledWith(...args);
}

/**
 * Helper to expect store method was called specific number of times
 */
export function expectStoreMethodCalledTimes<T>(
  spies: Record<string, jest.SpyInstance>, 
  methodName: keyof T, 
  times: number
) {
  expect(spies[methodName as string]).toHaveBeenCalledTimes(times);
}

export function createMockObserver() {
  return {
    configure: jest.fn(),
    render: jest.fn().mockImplementation((storeConstructor: any, selector: (store: any) => any) => {
      return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!mockRenderMetadata.has(target.constructor)) {
          mockRenderMetadata.set(target.constructor, []);
        }
        mockRenderMetadata.get(target.constructor).push({
          methodName: propertyKey,
          storeConstructor,
          selector
        });
        
        return descriptor;
      };
    }),
    observer: jest.fn().mockImplementation((target) => {
      return class extends target {
        constructor(...args: any[]) {
          super(...args);
          this.setupReactions();
        }

        setupReactions() {
          const renderMethods = mockRenderMetadata.get(target) || [];
          
          renderMethods.forEach(({ methodName, storeConstructor, selector }) => {
            try {
              const store = mockContainer.get(storeConstructor);
              
              const disposer = mobx.reaction(
                () => selector(store),
                (value) => {
                  try {
                    this[methodName](value);
                  } catch (error) {
                    if (error.message?.includes("Cannot read properties of null") || 
                        error.message?.includes("Cannot set properties of null") ||
                        error.message?.includes("Hls.js is not supported")) {
                    } else {
                      throw error;
                    }
                  }
                },
                { fireImmediately: true }
              );
              
              reactionDisposers.push(disposer);
            } catch (error) {
              console.warn(`Store ${storeConstructor.name} not found in container:`, error);
            }
          });
        }
      };
    }),
    handle: jest.fn().mockImplementation((storeConstructor: any, handlerFn: (store: any, ...args: any[]) => any) => {
      return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function (...args: any[]) {
          const result = originalMethod.apply(this, args);
          
          try {
            const store = mockContainer.get(storeConstructor);
            handlerFn(store, result);
          } catch (error) {
            console.warn(`Store ${storeConstructor.name} not found in container for @handle:`, error);
          }
          
          return result;
        };
        
        return descriptor;
      };
    }),
  };
}
