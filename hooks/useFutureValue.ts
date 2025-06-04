import { useState, useEffect } from 'react';

const useFutureValue = (initialValues) => {
    const [inputs, setInputs] = useState(initialValues);
    const [futureValue, setFutureValue] = useState(0);

    const calculateFutureValue = () => {
        const { principal, rate, time } = inputs;
        const calculatedFV = principal * Math.pow((1 + rate / 100), time);
        setFutureValue(calculatedFV);
    };

    useEffect(() => {
        calculateFutureValue();
    }, [inputs]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs((prevInputs) => ({
            ...prevInputs,
            [name]: parseFloat(value) || 0,
        }));
    };

    return {
        inputs,
        futureValue,
        handleInputChange,
    };
};

export default useFutureValue;