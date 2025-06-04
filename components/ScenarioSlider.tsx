import React from 'react';

const ScenarioSlider = ({ value, onChange, min, max }) => {
    return (
        <div className="scenario-slider">
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
                className="slider"
            />
            <div className="slider-value">{value}</div>
        </div>
    );
};

export default ScenarioSlider;