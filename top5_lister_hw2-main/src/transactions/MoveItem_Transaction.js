import jsTPS_Transaction from "./jsTPS";

export default class MoveItem_Transaction extends jsTPS_Transaction {
    constructor(app, oldIndex, newIndex) {
        super()
        this.app = app;
        this.oldIndex = oldIndex;
        this.newIndex = newIndex;
    }

    doTransaction() {
        this.app.moveItem(this.oldIndex, this.newIndex);
        this.app.undoRedoCheckForDo();
    }

    undoTransaction() {
        this.app.moveItem(this.newIndex, this.oldIndex);
        this.app.undoRedoCheckForUndo();
    }
}