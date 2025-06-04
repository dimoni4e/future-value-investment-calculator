import React from 'react';
import { Line } from 'react-chartjs-2';

const GrowthChart = ({ data }) => {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Future Value Growth',
                data: data.values,
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
            <h2>Growth Chart</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default GrowthChart;