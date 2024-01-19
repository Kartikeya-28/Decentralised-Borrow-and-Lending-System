import React from 'react'

const Table = ({address,time,amount}) => {
  return (
    <div>
        <table>
            <tbody>
                <td>{address}</td>
                <td>{time}</td>
                <td>{amount}</td>
            </tbody>
        </table>
    </div>
  )
}

export default Table