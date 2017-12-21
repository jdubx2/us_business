library(shiny)
library(dplyr)
#library(stringr)
#library(tidyr)
library(jsonlite)

df <- readRDS('us_bus.rds')

server <- function(input, output, session) {

  init_json <- toJSON(df %>% filter(n_type == 2))
  session$sendCustomMessage(type="two_char", init_json)
}