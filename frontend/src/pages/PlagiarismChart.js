import React, { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";

const PlagiarismChart = ({ confidenceScore }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Plagiarism", "Original"],
        datasets: [
          {
            label: "Plagiarism Percentage",
            data: [confidenceScore, 100 - confidenceScore],
            backgroundColor: ["#ff6b6b", "#4caf50"],
            borderColor: ["#ff6b6b", "#4caf50"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.raw !== null) {
                  label += context.raw + "%";
                }
                return label;
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [confidenceScore]);

  return <canvas ref={chartRef} />;
};

export default PlagiarismChart;
