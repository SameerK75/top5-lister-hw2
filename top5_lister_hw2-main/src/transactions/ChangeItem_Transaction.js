import jsTPS_Transaction from "./jsTPS";

export default class ChangeItem_Transaction extends jsTPS_Transaction {
    constructor(app, index, newName, oldName) {
        super();
        this.app = app;
        this.index = index;
        this.newName = newName;
        this.oldName = oldName;
    }

    doTransaction() {
        this.app.renameItem(this.index, this.newName);
    }

    undoTransaction() {
        this.app.renameItem(this.index, this.oldName);
    }
}