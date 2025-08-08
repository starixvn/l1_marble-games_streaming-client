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
            propertyInjections.set(propertyKey, token);
            PROPERTY_INJECTION_STORE.set(target.constructor, propertyInjections);
        } else {
            // Constructor parameter injection (more complex, not implemented for now)
        }
    };
});

export class Container {
    private bindings = new Map();
    private instances = new Map();

    bind(serviceIdentifier: any) {
        const binding = {
            to: jest.fn().mockReturnThis(),
            toSelf: jest.fn().mockImplementation(() => {
                this.instances.set(serviceIdentifier, null); // Mark for lazy instantiation
                return binding;
            }),
            toConstantValue: jest.fn().mockImplementation((value: any) => {
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

        // Create new instance with real dependency injection
        try {
            const instance = new serviceIdentifier();

            // Perform dependency injection based on metadata
            this.performDependencyInjection(instance, serviceIdentifier);

            this.instances.set(serviceIdentifier, instance);
            return instance;
        } catch {
            return {};
        }
    }

    private performDependencyInjection(instance: any, serviceIdentifier: any) {
        // Handle property injections
        const propertyInjections = PROPERTY_INJECTION_STORE.get(serviceIdentifier);
        if (propertyInjections) {
            for (const [propertyKey, token] of propertyInjections.entries()) {
                const dependency = this.resolveDependency(token);
                if (dependency !== null) {
                    instance[propertyKey] = dependency;
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

export default { injectable, inject, Container };
