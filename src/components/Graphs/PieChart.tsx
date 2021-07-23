import React from 'react';
import { Pie } from 'react-chartjs-2';

interface LineChartProps {
    labels: String[];
    label: String;
    data: Number[];
}

const LineChart: React.FC<LineChartProps> = (props) => {
    const data = {
        labels: props.labels,
        datasets: [
            {
                label: props.label,
                data: props.data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 0, 132, 0.2)',
                    'rgba(54, 162, 0, 0.2)',
                    'rgba(0, 206, 86, 0.2)',
                    'rgba(75, 100, 192, 0.2)',
                    'rgba(153, 102, 100, 0.2)',
                    'rgba(0, 159, 64, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255, 0, 132, 0.2)',
                    'rgba(54, 162, 0, 0.2)',
                    'rgba(0, 206, 86, 0.2)',
                    'rgba(75, 100, 192, 0.2)',
                    'rgba(153, 102, 100, 0.2)',
                    'rgba(0, 159, 64, 0.2)',
                ],
            }
        ]
    }
    return <Pie data={data} redraw={false} />
}

export default LineChart;