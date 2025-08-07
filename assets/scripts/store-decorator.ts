import type { Container } from "inversify";
import type { AnyConstructor } from "observer/dist/interfaces";

export const Stores = new Map<string, AnyConstructor>();

export function store(name: string) {
  return function (target: AnyConstructor) {
    Stores.set(name, target);

    return target;
  };
}

export function handleWindowMessage(container: Container) {
  return (event: MessageEvent) => {
    const data = event.data;

    if (
      !Array.isArray(data) ||
      data.length !== 2 ||
      typeof data[0] !== "string" ||
      typeof data[1] !== "object"
    ) {
      return;
    }

    const [name, value] = data;

    if (name === "click") {
      const element = document.getElementById("GameCanvas");
      const data = Object.assign(
        {},
        {
          bubbles: true,
          cancelable: true,
          view: window,
        },
        value,
      );

      element.dispatchEvent(new MouseEvent("click", data));
    }

    if (!Stores.has(name)) {
      return;
    }

    const store = Stores.get(name);

    if (!store) {
      return;
    }

    const instance = container.get(store);

    if (!instance) {
      return;
    }

    Object.assign(instance, value);
  };
}
