export default defineNuxtPlugin(async () => {
  const { Chart, registerables } = await import('chart.js/auto');
  Chart.register(...registerables);
  
  return {
    provide: {
      Chart
    }
  };
}); 