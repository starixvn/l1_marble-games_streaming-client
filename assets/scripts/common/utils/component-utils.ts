import { Color, Label, Node, Prefab, UIOpacity, UIRenderer, UITransform, instantiate, math, tween, v3 } from "cc";

export namespace ComponentUtils {
    export const getTransform = (node: Node): UITransform => {
        const uiTransform = node.getComponent(UITransform);

        if (uiTransform) {
            return uiTransform;
        } else {
            return node.addComponent(UITransform);
        }
    };
    export const moveToOtherNode = (node: Node, destNode: Node) => {
        const position = getTransform(destNode).convertToNodeSpaceAR(getTransform(node).convertToWorldSpaceAR(v3(0, 0, 0)));
        node.parent = destNode;
        node.position = position;
    };

    export const setEmptyLabels = (labels: Label[]) => {
        labels?.forEach((label) => {
            if (label) {
                label.string = "";
            }
        });
    };

    export const addChildFromPrefab = (prefab: Prefab, container: Node) => {
        if (prefab && container) {
            const toolTipNode = instantiate(prefab);
            container.addChild(toolTipNode);
        }
    };

    export const autoDisappear = (node: Node, isDetroy = true) => {
        const opacity = node.getComponent(UIOpacity);
        opacity.opacity = 1;
        const duration = 0.2;
        const delay = 2.5;
        tween(opacity).to(duration, { opacity: 255 }).delay(delay).to(duration, { opacity: 0 }).start();
        tween(node)
            .to(duration, {
                scale: math.Vec3.ONE,
            })
            .delay(delay)
            .to(duration, {
                scale: math.v3(1.5, 1.5),
            })
            .call(() => {
                if (isDetroy) {
                    node.destroy();
                }
            })
            .start();
    };

    export const hideOtherNotices = (nodes: Node[]) => {
        nodes.forEach((node) => {
            node.active = false;
        });
    };

    export const convertPosition = (container: Node, target: Node, offset = v3(0, 0, 0)) => {
        const transformContainer = getTransform(container);
        const transformTarget = getTransform(target);
        return transformContainer.convertToNodeSpaceAR(transformTarget.convertToWorldSpaceAR(offset));
    };

    type TransformData = {
        width?: number;
        height?: number;
        contentSize?: math.Size;
        anchorPoint?: math.Vec2;
        anchorX?: number;
        anchorY?: number;
    };
    export const setNodeTransform = (node: Node, tranformData: TransformData) => {
        if (!node || !node.isValid) {
            return;
        }
        const uiTransform = node.getComponent(UITransform);
        if (uiTransform && uiTransform.isValid) {
            Object.keys(tranformData).forEach((key) => {
                uiTransform[key] = tranformData[key];
            });
        }
    };

    export const setNodeColor = (node: Node, color: string | Color) => {
        const renderer = node.getComponent(UIRenderer);
        if (renderer) {
            renderer.color = color instanceof Color ? color : new Color(color);
        }
    };

    export const getUiOpacity = (node: Node) => {
        let uiOpacity = node.getComponent(UIOpacity);
        if (!uiOpacity) {
            uiOpacity = node.addComponent(UIOpacity);
        }
        return uiOpacity;
    };

    export const setOpacityNode = (node: Node, opacity: number) => {
        getUiOpacity(node).opacity = Math.max(1, opacity);
    };
}
