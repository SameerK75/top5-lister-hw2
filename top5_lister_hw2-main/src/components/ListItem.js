import React from "react";

export default class ListItem extends React.Component {
    constructor(props) {
        super(props);
        
        this.itemRef = React.createRef();

        this.state = {
            itemIndex: this.props.index,
            itemText: this.props.item,
            editActive: false,
        }
    }

    handleClick = (event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
            this.setState({oldText: this.state.itemText})
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

        this.props.renameItemCallback(index, text);
        this.handleToggleEdit();

    }

    handleDragOver = (event) => {
        event.preventDefault();
    }

    handleDragStart = (event) => {
        event.dataTransfer.setData("text", event.target.id);
    }

    handleOnDrop = (event) => {
        event.preventDefault();
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
                onClick = {this.handleClick}
                className = "top5-item"
                >
                {item}
                </div>
            )
        }
    }
}