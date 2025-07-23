import { ref } from 'vue';
import { useNuxtApp } from '#app';
import { useCurrency } from '~/composables/useCurrency';

export const useTransactionChart = (chartCanvas, chartData) => {
  const { $Chart } = useNuxtApp();
  const { formatRupiah, formatRupiahShort } = useCurrency();
  const chartInstance = ref(null);

  const initChart = () => {
    if (!process.client || !chartCanvas.value) return;

    if (chartInstance.value) {
      chartInstance.value.destroy();
    }

    const ctx = chartCanvas.value.getContext('2d');
    if (!chartData.value || chartData.value.length === 0) {
        return; 
    }

    chartInstance.value = new $Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.value.map(d => d.shortLabel || d.date),
        datasets: [{
          label: 'Revenue',
          data: chartData.value.map(d => d.amount || 0),
          borderColor: '#64ffda',
          backgroundColor: 'rgba(100, 255, 218, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#64ffda',
          pointBorderColor: '#1a1a1a',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#64ffda',
            bodyColor: '#ffffff',
            callbacks: {
              label: function(context) {
                const amount = formatRupiah(context.parsed.y);
                const point = chartData.value[context.dataIndex];
                return [
                  `Revenue: ${amount}`,
                  `Transactions: ${point?.count || 0}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return formatRupiahShort(value);
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  };

  const updateChart = () => {
    if (!chartInstance.value) return;
    chartInstance.value.data.labels = chartData.value.map(d => d.shortLabel || d.date);
    chartInstance.value.data.datasets[0].data = chartData.value.map(d => d.amount || 0);
    chartInstance.value.update();
  };

  return { initChart, updateChart };
};
