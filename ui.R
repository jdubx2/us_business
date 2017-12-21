library(shiny)

ui <- fluidPage(
  
  titlePanel(''),
  
  tags$head(
    tags$script(src="https://d3js.org/d3.v4.min.js"),
    tags$script(src="d3-legend.min.js"),
    tags$script(src="d3_tip.js"),
    tags$link(rel="stylesheet", type="text/css", href="styles.css")
  ),
  div(id = 'button_div',
      actionButton('refresh','Reset')),
  div(id = "div_bubble",
      tags$script(src="bubble.js"))
)
