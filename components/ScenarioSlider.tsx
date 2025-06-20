'use client'

import React from 'react'

interface ScenarioSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  label?: string
  unit?: string
}

const ScenarioSlider = ({
  value,
  onChange,
  min,
  max,
  label = 'Time Horizon',
  unit = 'years',
}: ScenarioSliderProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  // Calculate percentage for visual styling
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className="scenario-slider w-full">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {value} {unit}
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${percentage}%, #E5E7EB ${percentage}%, #E5E7EB 100%)`,
          }}
        />

        {/* Min/Max labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            {min} {unit}
          </span>
          <span>
            {max} {unit}
          </span>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider:focus {
          outline: none;
        }

        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  )
}

export default ScenarioSlider
