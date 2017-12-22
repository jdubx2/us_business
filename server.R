library(shiny)
library(dplyr)
library(stringr)
#library(tidyr)
library(jsonlite)

df <- readRDS('us_bus.rds')

df <- df %>% 
  mutate(parent = str_sub(NAICS_CODE, 1, 2)) %>% 
  filter(n_type %in% c(2,4,6))

server <- function(input, output, session) {

  init_json <- toJSON(df %>% filter(n_type == 2))
  session$sendCustomMessage(type="init", init_json)
  
  drill_down <- eventReactive(input$bubble_click,{
    drill_down <- toJSON(df %>% filter(parent == input$bubble_click[1], 
                                       n_type == as.numeric(input$bubble_click[[2]]) + 2))
  })
  
  output$test <- renderText({ as.numeric(input$bubble_click[[2]]) + 2 })
  
  observe(session$sendCustomMessage(type = "drill_down", drill_down()))
  
  refresh_chart <- eventReactive(input$refresh, {
    refresh_chart <- toJSON(df %>% filter(n_type == 2))
  })
  
  observe(session$sendCustomMessage(type = "refresh", refresh_chart()))
}