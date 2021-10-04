import React from "react";

export default class ListItem extends React.Component {
    constructor(props) {
        super(props);
        
        this.itemRef = React.createRef();

        this.state = {
            itemIndex: this.props.index,
            itemText: this.props.item,
            //oldText: this.props.item,
            editActive: false,
        }
    }

    handleClick = (event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
            this.setState({oldText: this.state.itemText,})
        }
        
    }

    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive,
        });
    }

    handleKeyPress = (event) => {
        if (event.code === "Enter") {
            this.handleBlur();
        }
    }

    handleUpdate = (event) => {
        this.setState({itemText: event.target.value});
    }

    handleBlur = (event) => {
        let index = this.state.itemIndex;
        let text = this.state.itemText;
        console.log("ListItem handleBlur:" + text);
        let oldText = this.state.oldText;
        this.props.addChangeItemTransactionCallback(index, text, oldText)
        this.handleToggleEdit();

    }

    handleDragOver = (event) => {
        event.preventDefault();
        //let listItem = this.itemRef.current;
        //listItem.classList.add("top5-item-dragged-to");
    }

    handleDragEnter = (event) => {
        let listItem = this.itemRef.current;
        listItem.classList.add("top5-item-dragged-to");
    }

    handleDragLeave = (event) => {
        let listItem = this.itemRef.current;
        listItem.classList.remove("top5-item-dragged-to");
    }

    handleDragStart = (event) => {
        event.dataTransfer.setData("text", event.target.id);
    }

    handleOnDrop = (event) => {
        event.preventDefault();
        let listItem = this.itemRef.current;
        listItem.classList.remove("top5-item-dragged-to");
        let droppedID = event.dataTransfer.getData("text");
        let droppedOnID = event.target.id;
        let index1 = droppedID.charAt(5);
        let index2 = droppedOnID.charAt(5);
        this.props.addMoveItemTransactionCallback(index1, index2);
    }

    render() {
        const {item, index} = this.props;
        if(this.state.editActive) {
            return(
                <input
                id = {"item-" + index}
                className = "top5-item"
                type = "text"
                onKeyPress = {this.handleKeyPress}
                onBlur = {this.handleBlur}
                onChange = {this.handleUpdate}
                defaultValue = {item}
                />
            )
        }
        else {
            return(
                <div
                id = {"item-" + index}
                ref = {this.itemRef} 
                draggable = "true"
                onDragOver = {this.handleDragOver}
                onDragStart = {this.handleDragStart}
                onDrop = {this.handleOnDrop}
                onDragEnter = {this.handleDragEnter}
                onDragLeave = {this.handleDragLeave}
                onClick = {this.handleClick}
                className = "top5-item"
                >
                {item}
                </div>
            )
        }
    }
}