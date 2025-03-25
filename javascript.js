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
    .domain([d3.max(formattedData, d => d.time), d3.min(formattedData, d => d.time)])
    .range([height, 0]);

  // Formateador para el eje X (años)
  const formatYear = d3.timeFormat("%Y");

  // Eje X con ticks cada 2 años
  g.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(x)
        .tickFormat(formatYear)
        .ticks(d3.timeYear.every(2))
    );

  // Eje Y con formato mm:ss
  g.append("g")
    .attr("id", "y-axis")
    .call(
      d3.axisLeft(y)
        .tickFormat(d => {
          const mins = Math.floor(d / 60);
          const secs = Math.floor(d % 60);
          return `${mins}:${secs < 10 ? "0" + secs : secs}`;
        })
    );
// Puntos (círculos)
g.selectAll(".dot")
  .data(formattedData)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("data-xvalue", d => d.year.getFullYear()) // Guardar solo el año (número)
  .attr("data-yvalue", d => d.time)
  .attr("cx", d => x(d.year))
  .attr("cy", d => y(d.time))
  .attr("r", 5)
  .attr("fill", d => d.doping ? "red" : "#0de21a")
  
     // Dentro del evento mouseover en tu código actual:
.on("mouseover", function(event, d) {
  const originalData = dataset.find(item => 
    new Date(item.Year, 0, 1).getTime() === d.year.getTime() && 
    item.Time === `${Math.floor(d.time/60)}:${String(d.time%60).padStart(2,"0")}`
  );
  
  tooltip.style("opacity", 0.9)
    .html(`
      <strong>Año:</strong> ${d.year.getFullYear()}<br>
      <strong>Tiempo:</strong> ${Math.floor(d.time/60)}:${String(d.time%60).padStart(2,"0")}<br>
      <strong>Nombre:</strong> ${originalData.Name}<br>
      <strong>Nacionalidad:</strong> ${originalData.Nationality}<br>
      <strong>Doping:</strong> ${originalData.Doping || "Ninguna alegación"}<br>
      ${originalData.URL ? `<a href="${originalData.URL}" target="_blank">🔗 Más info</a>` : ''}
    `)
    .attr("data-year", d.year.getFullYear())
    .style("left", `${event.pageX + 15}px`)
    .style("top", `${event.pageY - 15}px`);
}) 
 
  
 

// Crear leyenda
const legend = svg.append("g")
  .attr("id", "legend")
  .attr("transform", `translate(${width + margin.left + 20}, ${margin.top})`);

// Añadir rectángulos de colores
legend.selectAll("legend-rect")
  .data(["Doping", "No Doping"])
  .enter()
  .append("rect")
  .attr("x", 0)
  .attr("y", (d, i) => i * 25)
  .attr("width", 20)
  .attr("height", 20)
  .attr("fill", d => d === "Doping" ? "red" : "#0de21a");

// Añadir texto descriptivo
legend.selectAll("legend-text")
  .data(["Doping", "No Doping"])
  .enter()
  .append("text")
  .attr("x", -59)
  .attr("y", (d, i) => i * 25 + 15)
  .text(d => d)
  .style("font-size", "12px")
  .attr("alignment-baseline", "middle");

// Añadir título descriptivo
legend.append("text")
  .attr("x", -50)
  .attr("y", -10)
  .text("Leyenda:")
  .style("font-weight", "bold")
  .style("font-size", "14px"); 
}

// Obtener los datos y graficar
fetchData();