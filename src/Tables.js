import React from 'react'
import './Tables.css';
import numeral from 'numeral';

function Tables({ countries }) {
    return (
        <div className='tables'>
            <table>
                <tbody>
                    {countries.map(({ country, cases }) => (
                        <tr key={country}>
                            <td>
                                {country}
                            </td>
                            <td>
                                <strong>{numeral(cases).format('0,0')}</strong>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Tables
