import React, { useState } from 'react';


export default function Textarea(prop) {
    const [text, setText] = useState("Enter the text here");
    // const [mode, setMode] = useState("Dark Mode");
    // const [color, setColor] = useState(
    //     {
    //         color: 'black',
    //         backgroundColor: 'white'
    //     }
    // )
    const clearText = () => {
        if (text === "Enter the text here")
            setText("");
    }
    const upperCase = () => {
        console.log(text)
        let newtext = text.toUpperCase();
        setText(newtext);
        prop.alert('success','Text converted to Upper Case')
    }
    const lowerCase = () => {
        console.log(text)
        let newtext = text.toLowerCase();
        setText(newtext);
        prop.alert('success','Text converted to Lower Case')
    }
    const addText = (event) => {
        setText(event.target.value);
    }
    // const changeMode = () => {
    //     if (color.color === 'black') {
    //         setColor({
    //             color: 'white',
    //             backgroundColor: 'black'
    //         })
    //         setMode("Light Mode");
    //     }
    //     else {
    //         setColor({
    //             color: 'black',
    //             backgroundColor: 'white'
    //         })
    //         setMode("Dark Mode");
    //     }
    // }
    return (
        <div className='container' style={{marginTop:'60px'}} /*style={color}*/>
            <div className="form-group">
                <h1>Enter Text</h1>
                <textarea className="form-control" id="my-box" rows="8" value={text} onClick={clearText} onChange={addText} style = {{backgroundColor:prop.mode === 'light' ? '#f0f0f0' : '#333',color:prop.mode === 'light' ? 'black' : 'white' }}></textarea>
                <button className="btn-primary btn my-3" onClick={upperCase}>Convert to UpperCase</button>
                <button className="btn-success btn my-3 mx-3" onClick={lowerCase}>Convert to LowerCase</button>
                {/* <button className="btn-dark btn my-3" onClick={changeMode}>{mode}</button> */}
            </div>
            <h1>Text Summary</h1>
            <p>Words: {text.split(/\s+/).filter((element)=>{return element.length!==0}).length}</p>
            <p>Characters: {text.length}</p>
            <h1>Summary</h1>
            <p>{text}</p>
        </div>
    )
}
