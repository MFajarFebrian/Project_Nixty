import Chart from 'chart.js/auto';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      Chart
    }
  };
}); 