const svg = d3.select("svg");
const margin = { top: 80, right: 60, bottom: 50, left: 100 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const apiUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

// Crear el tooltip
const tooltip = d3.select("#tooltip");

// Función para obtener datos de la API
async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Error al obtener los datos");
    const data = await response.json();
    processData(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Función para procesar los datos y crear la gráfica
function processData(dataset) {
  if (!Array.isArray(dataset)) throw new Error("Los datos no son un array");

  // Convertir tiempo "mm:ss" a segundos
  const formattedData = dataset.map(d => {
    const timeParts = d.Time.split(":");
    const timeInSeconds = +timeParts[0] * 60 + +timeParts[1];
    return {
      year: new Date(d.Year, 0, 1),
      time: timeInSeconds,
      doping: d.Doping
    };
  });
   
  
  
  
  // Escalas
  const x = d3.scaleTime()
    .domain([d3.min(formattedData, d => d.year), d3.max(formattedData, d => d.year)])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([d3.max(formattedData, d => d.time), d3.min(formattedData, d => d.time)]) // Invertido para que el menor tiempo esté arriba
    .range([height, 0]);

  // Ejes
  g.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  g.append("g")
    .attr("id", "y-axis")
    .call(d3.axisLeft(y).tickFormat(d => `${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`)); // Mostrar mm:ss

  // Puntos
  g.selectAll(".dot")
    .data(formattedData)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("data-xvalue", d => d.year.toISOString()) // ✅ Convertir el año a ISO
    .attr("data-yvalue", d => d.time) // ✅ Guardar el tiempo en segundos directamente
    .attr("cx", d => x(d.year))
    .attr("cy", d => y(d.time))
    .attr("r", 5)
    .attr("fill", d => d.doping ? "red" : "#0de21a") // Resaltar si hubo doping
    .on("mouseover", function (event, d) {
      tooltip.style("opacity", 0.9)
        .html(`Año: ${d.year.getFullYear()}<br>Tiempo: ${Math.floor(d.time / 60)}:${String(d.time % 60).padStart(2, "0")}`)
        .attr("data-xvalue", d.year.toISOString()) // ✅ Tooltip con formato ISO
        .attr("data-yvalue", d.time) // ✅ Tooltip con el valor en segundos
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 38}px`);
    })
    .on("mouseout", () => tooltip.style("opacity", 0));
  
  
  const xAxis = d3.axisBottom(x)
  .ticks(d3.timeYear.every(2)) // Muestra un tick cada 2 años
  .tickFormat(d3.format("d")); // Formatea el año como número entero (sin decimales)

  
}

// Obtener los datos y graficar
fetchData();