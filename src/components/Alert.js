
import React from 'react'

export default function Alert(prop) {
    const capitalize = (type)=>{
        let str = type.toLowerCase();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    if (!prop.alert) {
        return null; 
    }
    return (
        //prop.alert && 
        <div class={`alert alert-${prop.alert.type} alert-dismissible fade show w-100 position-fixed`} role="alert">
            <strong>{capitalize(prop.alert.type)}</strong> {prop.alert.message}
        </div>
    )
}
