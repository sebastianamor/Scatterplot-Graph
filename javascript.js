const margin = {top: 80, right: 100, bottom: 80, left: 100};
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Crear SVG
    const svg = d3.select("#container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Tooltip
    const tooltip = d3.select("#tooltip");
    
    // Cargar datos
    d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
      .then(data => {
        // Procesar datos
        const formattedData = data.map(d => {
          const timeParts = d.Time.split(":");
          const timeInSeconds = (+timeParts[0] * 60) + (+timeParts[1]);
          const date = new Date(d.Year, 0, 1);
          return {
            ...d,
            year: date,
            time: timeInSeconds,
            timeFormatted: d.Time
          };
        });
        
        // Escalas
        const x = d3.scaleTime()
          .domain([
            d3.timeYear.floor(d3.min(formattedData, d => d.year)),
            d3.timeYear.ceil(d3.max(formattedData, d => d.year))
          ])
          .range([0, width])
          .nice();
        
        const yExtent = d3.extent(formattedData, d => d.time);
        const yPadding = (yExtent[1] - yExtent[0]) * 0.05;
        
        const y = d3.scaleLinear()
          .domain([yExtent[1] + yPadding, yExtent[0] - yPadding])
          .range([0, height])
          .nice();
        
        // Ejes
        const xAxis = d3.axisBottom(x)
          .tickFormat(d3.timeFormat("%Y"))
          .ticks(d3.timeYear.every(2));
        
        const yAxis = d3.axisLeft(y)
          .tickFormat(d => {
            const mins = Math.floor(d / 60);
            const secs = Math.floor(d % 60);
            return `${mins}:${secs < 10 ? "0" + secs : secs}`;
          });
        
        svg.append("g")
          .attr("id", "x-axis")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis);
        
        svg.append("g")
          .attr("id", "y-axis")
          .call(yAxis);
        
        // Etiquetas de ejes
        svg.append("text")
          .attr("class", "axis-label")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom - 20)
          .text("Año");
        
        svg.append("text")
          .attr("class", "axis-label")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -margin.left + 40)
          .text("Tiempo (min:seg)");
        
        // Puntos
        svg.selectAll(".dot")
          .data(formattedData)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("data-xvalue", d => d.year.toISOString())
          .attr("data-yvalue", d => {
            const date = new Date(0);
            date.setSeconds(d.time);
            return date.toISOString();
          })
          .attr("cx", d => x(d.year))
          .attr("cy", d => y(d.time))
          .attr("r", 8)
          .attr("fill", d => d.Doping ? "#ff6b6b" : "#48dbfb")
          .on("mouseover", function(event, d) {
            tooltip.style("opacity", 0.9)
              .html(`
                <strong>${d.Name}</strong><br>
                Nacionalidad: ${d.Nationality}<br>
                Año: ${d.Year}<br>
                Tiempo: ${d.timeFormatted}<br>
                ${d.Doping ? `<em>${d.Doping}</em>` : "No hubo alegaciones de doping"}
              `)
              .attr("data-year", d.year.toISOString())
              .style("left", `${event.pageX + 10}px`)
              .style("top", `${event.pageY - 28}px`);
          })
          .on("mouseout", function() {
            tooltip.style("opacity", 0);
          });
        
        // Leyenda
        const legend = svg.append("g")
          .attr("id", "legend")
          .attr("transform", `translate(${width - 150}, 20)`);
        
        legend.append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", "#48dbfb");
        
        legend.append("text")
          .attr("x", 30)
          .attr("y", 15)
          .text("Sin doping");
        
        legend.append("rect")
          .attr("x", 0)
          .attr("y", 30)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", "#ff6b6b");
        
        legend.append("text")
          .attr("x", 30)
          .attr("y", 45)
          .text("Con doping");
      })
      .catch(error => {
        console.error("Error al cargar los datos:", error);
      });