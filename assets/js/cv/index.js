
'use strict';

window.addEventListener('load',
    () => {
        Chart.register(ChartDataLabels)
        const config = {
            type: 'doughnut',
            options: {
                cutout: '30%',
                plugins: {
                    legend: false,
                    datalabels: {
                        color: 'white',
                        formatter: function (value, context) {
                            return context.chart.data.labels[context.dataIndex]+"\n"+Math.round(value/context.chart.getDatasetMeta(0).total * 100)+'%';
                        },
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
            },
            data: {
                labels: [
                    "People\nmanagement",
                    "Project\nmanagement",
                    "Solution\narchitecture",
                    "Product\nmanagement",
                ],
                datasets: [
                    {
                        label: 'My day',
                        data: [30, 30, 20, 20],
                        borderColor: '#595959',
                        backgroundColor: [
                            '#75923C',
                            '#EE8203',
                            '#699ABA',
                            '#7F7F7F',
                        ],
                    }
                ]
            },
        };
        const chartElement = document.getElementById('cv-chart');
        new Chart(chartElement, config);
    }
);
