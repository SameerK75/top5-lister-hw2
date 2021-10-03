import React from "react";

export default class ListItem extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            itemIndex: this.props.index,
            itemText: this.props.item,
            editActive: false,
        }
    }

    handleClick = (event) => {
        if (event.detail === 2) {
            this.handleToggleEdit(event);
        }
        
    }

    handleToggleEdit = (event) => {
        this.setState({
            editActive: !this.state.editActive
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
        this.props.renameItemCallback(index, text);
        this.handleToggleEdit();

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
                draggable = "true"
                onClick = {this.handleClick}
                className = "top5-item"
                >
                {item}
                </div>
            )
        }
    }
}