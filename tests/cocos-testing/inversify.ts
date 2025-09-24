import { jest } from "@jest/globals";

// Store for dependency metadata
const METADATA_STORE = new WeakMap();
const PROPERTY_INJECTION_STORE = new WeakMap();

export const injectable = jest.fn().mockImplementation(() => {
    return (target: any) => {
        // Mark class as injectable
        METADATA_STORE.set(target, { injectable: true });
        return target;
    };
});

export const inject = jest.fn().mockImplementation((token: any) => {
    return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (propertyKey !== undefined) {
            // Property injection - store by constructor
            let propertyInjections = PROPERTY_INJECTION_STORE.get(target.constructor) || new Map();
            propertyInjections.set(propertyKey, { token, isMulti: false });
            PROPERTY_INJECTION_STORE.set(target.constructor, propertyInjections);
        } else {
            // Constructor parameter injection (more complex, not implemented for now)
        }
    };
});

export const multiInject = jest.fn().mockImplementation((token: any) => {
    return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (propertyKey !== undefined) {
            // Multi-property injection - store by constructor
            let propertyInjections = PROPERTY_INJECTION_STORE.get(target.constructor) || new Map();
            propertyInjections.set(propertyKey, { token, isMulti: true });
            PROPERTY_INJECTION_STORE.set(target.constructor, propertyInjections);
        } else {
            // Constructor parameter injection for multiInject
            let constructorInjections = METADATA_STORE.get(target) || { constructorParams: [] };
            constructorInjections.constructorParams[parameterIndex] = { token, isMulti: true };
            METADATA_STORE.set(target, constructorInjections);
        }
    };
});

export class Container {
    private bindings = new Map();
    private instances = new Map();
    private multiBindings = new Map(); // Store multiple bindings for same token

    bind(serviceIdentifier: any) {
        const binding = {
            to: jest.fn().mockReturnThis(),
            toSelf: jest.fn().mockImplementation(() => {
                this.instances.set(serviceIdentifier, null); // Mark for lazy instantiation
                return binding;
            }),
            toConstantValue: jest.fn().mockImplementation((value: any) => {
                // Handle multi-binding
                if (this.multiBindings.has(serviceIdentifier)) {
                    this.multiBindings.get(serviceIdentifier).push(value);
                } else {
                    this.multiBindings.set(serviceIdentifier, [value]);
                }
                this.instances.set(serviceIdentifier, value);
                return binding;
            }),
        };
        this.bindings.set(serviceIdentifier, binding);
        return binding;
    }

    get(serviceIdentifier: any) {
        // Return existing instance if available
        if (this.instances.has(serviceIdentifier)) {
            const instance = this.instances.get(serviceIdentifier);
            if (instance !== null) {
                return instance;
            }
        }

        // Create new instance with constructor dependency injection
        try {
            const constructorArgs = this.resolveConstructorDependencies(serviceIdentifier);
            const instance = new serviceIdentifier(...constructorArgs);

            // Perform property dependency injection based on metadata
            this.performDependencyInjection(instance, serviceIdentifier);

            this.instances.set(serviceIdentifier, instance);
            return instance;
        } catch {
            return {};
        }
    }

    private resolveConstructorDependencies(serviceIdentifier: any): any[] {
        const metadata = METADATA_STORE.get(serviceIdentifier);
        if (!metadata || !metadata.constructorParams) {
            return [];
        }

        return metadata.constructorParams.map((param: any) => {
            if (!param) return undefined;
            
            if (param.isMulti) {
                // Return array of all bound instances for multi-injection
                return this.multiBindings.get(param.token) || [];
            } else {
                return this.resolveDependency(param.token);
            }
        });
    }

    private performDependencyInjection(instance: any, serviceIdentifier: any) {
        // Handle property injections
        const propertyInjections = PROPERTY_INJECTION_STORE.get(serviceIdentifier);
        if (propertyInjections) {
            for (const [propertyKey, injection] of propertyInjections.entries()) {
                if (injection.isMulti) {
                    // Multi-injection: return array of all bound instances
                    instance[propertyKey] = this.multiBindings.get(injection.token) || [];
                } else {
                    // Single injection
                    const dependency = this.resolveDependency(injection.token);
                    if (dependency !== null) {
                        instance[propertyKey] = dependency;
                    }
                }
            }
        }
    }

    private resolveDependency(token: any): any {
        // First try to get exact match
        if (this.instances.has(token)) {
            const instance = this.instances.get(token);
            if (instance !== null) {
                return instance;
            }
        }

        // Try to resolve by creating new instance if it's a constructor
        if (typeof token === "function") {
            try {
                const newInstance = new token();
                this.instances.set(token, newInstance);
                return newInstance;
            } catch {
                // Could not instantiate
            }
        }

        return null;
    }
}

export default { injectable, inject, multiInject, Container };
