import { _decorator, Component, Node } from 'cc';
import { IntroStore } from './intro-store';
import Observer from "observer";
import { VideoStatus } from '../streaming/streaming-type';
const { ccclass, property } = _decorator;
const { observer, handle, render } = Observer;

@ccclass('IntroManager')
@observer
export class IntroManager extends Component {
    
    @property(Node)
    phaseNode: Node[] = [];

    @render(IntroStore, (store) => store.status)
    private syncStatus(status: VideoStatus) {
        this.phaseNode.forEach((node) => {
            node.active = status !== VideoStatus.Playing;
        });
    }
}


