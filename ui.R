library(shiny)

ui <- fluidPage(
  
    tags$script(src="https://d3js.org/d3.v4.min.js"),
    tags$script(src="d3-legend.min.js"),
    tags$script(src="d3_tip.js"),
    tags$script(src ="d3-scale-chromatic.v1.min.js"),
    tags$script(src ="colorbox.js"),
    tags$script(src ="jquery1_9.js"),
    tags$link(rel="stylesheet", type="text/css", href="styles.css"),
    tags$link(rel="stylesheet", type="text/css", href="colorbox.css"),
    tags$link(rel="stylesheet", type="text/css", href="//fonts.googleapis.com/css?family=Open+Sans"),
    tags$script('function openColorBox(){
          $.colorbox({iframe:true, width:"380px", height:"430px", scrolling:false, innerHeight:"25px", href: "pop.html", opacity:".7"});
        }

        setTimeout(openColorBox, 2500);'),
  # div(id = 'button_div',
  #     actionButton('refresh','Reset')),
  div(id = "div_bubble",
      tags$script(src="bubble.js"))
  #,verbatimTextOutput("test")
)
