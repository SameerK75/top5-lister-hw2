import React from "react";

export default class EditToolbar extends React.Component {

    //handleCloseList() {
    //    this.props.closeCallback();
    //}
    render() {
        const {closeCallback, undoCallback, redoCallback, undoButtonClass, redoButtonClass, closeButtonClass} = this.props;
        return (
            <div id="edit-toolbar">
                <div 
                    id='undo-button'
                    onClick = {undoCallback} 
                    className= {undoButtonClass}>
                        &#x21B6;
                </div>
                <div
                    id='redo-button'
                    onClick = {redoCallback} 
                    className={redoButtonClass}>
                        &#x21B7;
                </div>
                <div
                    id='close-button'
                    className= {closeButtonClass}
                    onClick = {closeCallback}>
                    
                        &#x24E7;
                </div>
            </div>
        )
    }
}