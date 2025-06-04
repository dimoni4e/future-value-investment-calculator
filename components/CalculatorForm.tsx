import React, { useState } from 'react';

const CalculatorForm = () => {
    const [principal, setPrincipal] = useState(0);
    const [rate, setRate] = useState(0);
    const [time, setTime] = useState(0);
    const [futureValue, setFutureValue] = useState(null);

    const calculateFutureValue = (e) => {
        e.preventDefault();
        const fv = principal * Math.pow((1 + rate / 100), time);
        setFutureValue(fv);
    };

    return (
        <div className="calculator-form">
            <h2>Future Value Calculator</h2>
            <form onSubmit={calculateFutureValue}>
                <div>
                    <label htmlFor="principal">Principal Amount:</label>
                    <input
                        type="number"
                        id="principal"
                        value={principal}
                        onChange={(e) => setPrincipal(Number(e.target.value))}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="rate">Annual Interest Rate (%):</label>
                    <input
                        type="number"
                        id="rate"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="time">Time (years):</label>
                    <input
                        type="number"
                        id="time"
                        value={time}
                        onChange={(e) => setTime(Number(e.target.value))}
                        required
                    />
                </div>
                <button type="submit">Calculate Future Value</button>
            </form>
            {futureValue !== null && (
                <div>
                    <h3>Future Value: ${futureValue.toFixed(2)}</h3>
                </div>
            )}
        </div>
    );
};

export default CalculatorForm;