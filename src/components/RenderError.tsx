import React from 'react'

export default function RenderError({ text }: any) {
    return (
        <div className='' style={{
            color: 'red',
            fontSize: '1rem'
        }}>*{text}</div>
    )
}
