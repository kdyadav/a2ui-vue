/**
 * useChartRenderer.js
 * 
 * Composable for rendering Plotly charts in A2UI components.
 * Handles all Plotly-specific logic including data transformation,
 * chart configuration, and lifecycle management.
 */

import { ref, watch, onMounted, nextTick } from 'vue';

/**
 * Creates a chart renderer for Plotly visualizations
 * @param {Object} options - Configuration options
 * @param {Function} options.resolve - Data resolver function
 * @param {Ref} options.args - Component arguments (reactive)
 * @param {Ref} options.data - Data model (reactive)
 * @returns {Object} Chart renderer utilities
 */
export function useChartRenderer({ resolve, args, data }) {
  const chartRef = ref(null);

  /**
   * Extracts numeric value from various data formats
   * @param {*} pt - Data point (number, string, or object)
   * @returns {number} Numeric value
   */
  const getChartValue = (pt) => {
    if (typeof pt === 'number') return pt;
    if (typeof pt === 'string') return parseFloat(pt);
    if (pt && typeof pt === 'object') {
      if (pt.val !== undefined) return pt.val;
      if (pt.value !== undefined) return pt.value;
    }
    return 0;
  };

  /**
   * Extracts label from data point
   * @param {*} pt - Data point
   * @param {number} i - Index (fallback)
   * @returns {string|number} Label value
   */
  const getChartLabel = (pt, i) => {
    if (pt && typeof pt === 'object' && pt.item) return pt.item;
    return i;
  };

  /**
   * Draws or updates the Plotly chart
   */
  const drawChart = () => {
    console.log('drawChart called, chartRef:', !!chartRef.value, 'Plotly:', !!window.Plotly);

    if (!chartRef.value) {
      console.warn('Chart ref not available');
      return;
    }

    if (!window.Plotly) {
      console.warn('Plotly not loaded');
      return;
    }

    console.log('Chart args:', args.value);
    console.log('Chart dataBinding:', args.value.dataBinding);

    // Resolve data binding (supports both string paths and object paths)
    let rawData;
    if (typeof args.value.dataBinding === 'string') {
      // Direct string path like "/path"
      const parts = args.value.dataBinding.split('/').filter(p => p);
      rawData = parts.reduce((acc, k) => 
        (acc && acc[k] !== undefined) ? acc[k] : undefined, 
        data.value
      );
    } else {
      // Object with path property like {path: "/path"}
      rawData = resolve(args.value.dataBinding);
    }

    console.log('Chart rawData after resolve:', rawData, 'isArray:', Array.isArray(rawData));

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn('Chart data is not an array or is empty:', rawData);
      return;
    }

    // Transform data for Plotly
    const xValues = rawData.map((pt, i) => getChartLabel(pt, i));
    const yValues = rawData.map((pt) => getChartValue(pt));

    console.log('Chart xValues:', xValues, 'yValues:', yValues);

    // Create Plotly trace
    const trace = {
      x: xValues,
      y: yValues,
      type: args.value.type === 'line' ? 'scatter' : 'bar',
      mode: args.value.type === 'line' ? 'lines+markers' : undefined,
      marker: {
        color: '#6366f1', // Indigo-500
        opacity: 0.8,
        line: {
          color: '#818cf8', // Indigo-400
          width: 1
        }
      },
      line: args.value.type === 'line' ? {
        color: '#6366f1',
        width: 3,
        shape: 'spline'
      } : undefined
    };

    // Chart layout configuration
    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { t: 10, b: 30, l: 35, r: 10 },
      showlegend: false,
      xaxis: {
        showgrid: false,
        zeroline: false,
        tickfont: { color: '#71717a', size: 10 },
        fixedrange: true
      },
      yaxis: {
        showgrid: true,
        gridcolor: '#27272a',
        zeroline: false,
        tickfont: { color: '#71717a', size: 10 },
        fixedrange: true
      },
      autosize: true,
      height: 128
    };

    const config = {
      displayModeBar: false,
      responsive: true
    };

    // Use react() for efficient updates
    window.Plotly.react(chartRef.value, [trace], layout, config);
  };

  return {
    chartRef,
    drawChart
  };
}

