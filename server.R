library(shiny)
library(dplyr)
library(stringr)
#library(tidyr)
library(jsonlite)

df <- readRDS('us_bus.rds')

four_codes <- df %>%
  filter(n_type == 4) %>%
  select(NAICS_CODE, four_desc = NAICS_DESCRIPTION)
two_codes <- df %>%
  filter(n_type == 2) %>%
  select(NAICS_CODE, two_desc = NAICS_DESCRIPTION)

df <- df %>%
  filter(n_type %in% c(2,4,6)) %>%
  mutate(parent = ifelse(n_type == 2, str_sub(NAICS_CODE, 1, 2), str_sub(NAICS_CODE, 1, 4)),
         two_code = str_sub(NAICS_CODE,1,2)) %>%
  left_join(four_codes, by = c('parent' = 'NAICS_CODE')) %>%
  left_join(two_codes, by = c('two_code' = 'NAICS_CODE')) %>%
  mutate(tl_lab = ifelse(n_type == 2, 'All', two_desc),
         sl_lab = ifelse(n_type != 6, 'All', four_desc))

server <- function(input, output, session) {

  init_json <- toJSON(df %>% filter(n_type == 2))
  session$sendCustomMessage(type="init", init_json)
  
  drill_down <- eventReactive(input$bubble_click,{
    drill_down <- toJSON(df %>% filter(str_detect(parent, paste0("^",input$bubble_click[[1]],".*")), 
                                       n_type == ifelse(as.numeric(input$bubble_click[[2]]) >= 4, 6,
                                                        as.numeric(input$bubble_click[[2]]) + 2)))
  })
  
  output$test <- renderText({ as.numeric(input$bubble_click[[2]]) + 2 })
  
  observe(session$sendCustomMessage(type = "drill_down", drill_down()))
  
  refresh_chart <- eventReactive(input$refresh, {
    refresh_chart <- toJSON(df %>% filter(n_type == 2))
  })
  
  observe(session$sendCustomMessage(type = "refresh", refresh_chart()))
}
