import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './transactions/jsTPS';
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction";

// THESE ARE OUR REACT COMPONENTS
import DeleteModal from './components/DeleteModal';
import Banner from './components/Banner.js';
import Sidebar from './components/Sidebar.js';
import Workspace from './components/Workspace.js';
import Statusbar from './components/Statusbar.js';
import MoveItem_Transaction from './transactions/MoveItem_Transaction';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS WILL MANAGE TRANSACTIONS
        this.tps = new jsTPS();
        window.addEventListener('keydown', this.handleUndoRedo);

        // THIS WILL TALK TO LOCAL STORAGE)
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentList : null,
            sessionData : loadedSessionData,
            addButton   : "top5-button",
            undoButton  : "top5-button-disabled",
            redoButton  : "top5-button-disabled",
            closeButton : "top5-button-disabled"
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        if(this.state.currentList === null) {
            // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            items: ["?", "?", "?", "?", "?"]
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT IT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentList: newList,
            addButton: "top5-button-disabled",
            closeButton: "top5-button",
            undoButton: "top5-button-disabled",
            redoButton: "top5-button-disabled",
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);
            this.db.mutationUpdateSessionData(this.state.sessionData)
        });
        }
        
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let currentKey = -1
        if(this.state.currentList !== null) {
            currentKey = this.state.currentList.key;
            console.log(currentKey);
            console.log(key);
        }
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentList: newCurrentList,
            sessionData: prevState.sessionData,
            addButton: "top5-button-disabled",
            closeButton: "top5-button"
        }), () => {
            // ANY AFTER EFFECTS?
            //this.db.mutationUpdateSessionData(this.state.sessionData);
            if(currentKey != key) {
                this.tps.clearAllTransactions();
            }
            this.undoRedoCheck();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentList: null,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: this.state.sessionData,
            addButton: "top5-button",
            undoButton: "top5-button-disabled",
            redoButton: "top5-button-disabled",
            closeButton: "top5-button-disabled",
        }), () => {
            // ANY AFTER EFFECTS?
            this.tps.clearAllTransactions();
        });
    }
    deleteList = (keyNamePair) => {
        // SOMEHOW YOU ARE GOING TO HAVE TO FIGURE OUT
        // WHICH LIST IT IS THAT THE USER WANTS TO
        // DELETE AND MAKE THAT CONNECTION SO THAT THE
        // NAME PROPERLY DISPLAYS INSIDE THE MODAL
        this.showDeleteListModal();
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion: keyNamePair,
            sessionData: this.state.sessionData
        }))
    }

    confirmDelete = () => {
        let keyToDelete = this.state.listKeyPairMarkedForDeletion.key;
        let listToDelete = this.db.queryGetList(keyToDelete);
        let newCurrentList = null;
        let newAdd = "top5-button";
        let newClose = "top5-button-disabled";
        if(this.state.currentList !== null ) {
            if(keyToDelete !== this.state.currentList.key) {
                newCurrentList = this.state.currentList;
                newAdd = "top5-button-disabled";
                newClose = "top5-button";
            }
        }
        let currentPairs = [...this.state.sessionData.keyNamePairs];
        let deleteIndex = currentPairs.indexOf(this.state.listKeyPairMarkedForDeletion);
        currentPairs.splice(deleteIndex, 1);

        this.setState(prevState => ({
            currentList: newCurrentList,
            addButton: newAdd,
            closeButton: newClose,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: currentPairs
            }
        }), () => {
            this.db.mutationDeleteList(listToDelete);
            this.db.mutationUpdateSessionData(this.state.sessionData);
            if(newCurrentList === null) {
                this.tps.clearAllTransactions();
            }
            this.undoRedoCheck();

        });

        this.hideDeleteListModal();


    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal() {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }

    handleUndoRedo = (event) => {
        if(event.ctrlKey) {
            if(event.key === 'z'){
                this.undo();
            }
            else if(event.key === 'y'){
                this.redo();
            }
        }
    }

    renameItem = (index, newName) => {
        let editList = this.state.currentList
        if(editList !== null) {
            editList.items[index] = newName;
        }
        let key = editList.key;
        this.setState(prevState => ({
            currentList: editList,
            sessionData: prevState.sessionData
        }), () => {
            let list = this.db.queryGetList(key);
            list.items[index] = newName
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });

    }

    addChangeItemTransaction = (index, text, oldText) => {
        let transaction = new ChangeItem_Transaction(this, index, text, oldText);
        this.tps.addTransaction(transaction);
    };

    moveItem = (oldIndex, newIndex) => {
        let items = this.state.currentList.items;
        items.splice(newIndex, 0, items.splice(oldIndex, 1)[0]);
        this.setState(prevState => ({
            currentList: this.state.currentList,
            sessionData: prevState.sessionData
        }))
        this.db.mutationUpdateList(this.state.currentList);
        this.db.mutationUpdateSessionData(this.state.sessionData);
    }

    addMoveItemTransaction = (oldIndex, newIndex) => {
        let transaction = new MoveItem_Transaction(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
    }

    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
        }
    }

    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();
        }
    
    }

    undoRedoCheck = () => {
        let newUndo = "top5-button-disabled";
        if (this.tps.hasTransactionToUndo()) {
            newUndo = "top5-button";
        }
        let newRedo = "top5-button-disabled";
        if (this.tps.hasTransactionToRedo()) {
            newRedo = "top5-button";
        }
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            undoButton: newUndo,
            redoButton: newRedo
        }))
    }  

    undoRedoCheckForDo = () => {
        let newUndo = "top5-button-disabled";
        if ((this.tps.mostRecentTransaction + 1) >= 0) {
            newUndo = "top5-button";
        }
        let newRedo = "top5-button-disabled";
        if ((this.tps.mostRecentTransaction+2) < this.tps.numTransactions) {
            newRedo = "top5-button";
        }
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            undoButton: newUndo,
            redoButton: newRedo
        }))
    }

    undoRedoCheckForUndo = () => {
        let newUndo = "top5-button-disabled";
        if ((this.tps.mostRecentTransaction - 1) >= 0) {
            newUndo = "top5-button";
        }
        let newRedo = "top5-button-disabled";
        if ((this.tps.mostRecentTransaction) < this.tps.numTransactions) {
            newRedo = "top5-button";
        }
        this.setState(prevState => ({
            currentList: prevState.currentList,
            sessionData: prevState.sessionData,
            undoButton: newUndo,
            redoButton: newRedo
        }))
    }

    render() {
        return (
            <div id="app-root">
                <Banner 
                    title='Top 5 Lister'
                    closeCallback={this.closeCurrentList}
                    undoCallback = {this.undo}
                    redoCallback = {this.redo}
                    undoButtonClass = {this.state.undoButton}
                    redoButtonClass = {this.state.redoButton}
                    closeButtonClass = {this.state.closeButton} />
                <Sidebar
                    heading='Your Lists'
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    createNewListCallback={this.createNewList}
                    deleteListCallback={this.deleteList}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                    addButtonClass = {this.state.addButton}
                />
                <Workspace
                    currentList={this.state.currentList}
                    renameItemCallback = {this.renameItem}
                    addChangeItemTransactionCallback = {this.addChangeItemTransaction}
                    addMoveItemTransactionCallback = {this.addMoveItemTransaction}/>
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteModal
                    hideDeleteListModalCallback={this.hideDeleteListModal}
                    listKeyPair = {this.state.listKeyPairMarkedForDeletion}
                    confirmDeleteCallback = {this.confirmDelete}
                />
            </div>
        );
    }
}

export default App;
