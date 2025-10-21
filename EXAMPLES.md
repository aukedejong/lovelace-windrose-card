# Lovelace Windrose card 
## Configuration examples

<img alt="Example for config yaml" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/examples/minimal-right.png?raw=true" width="482"/>

```yaml
type: custom:windrose-card
title: Wind direction
data_period:
  hours_to_show: 400
refresh_interval: 300
windspeed_bar_location: bottom
windspeed_bar_full: true
hide_windspeed_bar: true
wind_direction_count: 32
wind_direction_entity:
  entity: sensor.wind_direction_azimuth
  use_statistics: false
  direction_compensation: 0
windspeed_entities:
  - entity: sensor.wind_speed
    name: Speed
    speed_unit: auto
    use_statistics: false
corner_info:
  top_left:
    label: Current windspeed
    unit: " kph"
    color: red
    entity: sensor.wind_gust
  top_right:
    label: Wind direction
    unit: °
    entity: sensor.wind_direction_azimuth
  bottom_left:
    label: Compass
    unit: °
    entity: input_number.compass
output_speed_unit: mps
speed_range_beaufort: true
windrose_draw_north_offset: 0
current_direction:
  show_arrow: true
  arrow_size: 70
  center_circle_size: 39
cardinal_direction_letters: NOZW
matching_strategy: direction-first
center_calm_percentage: false
log_level: DEBUG
```


<img alt="Peview bars bottom" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/examples/maximal-bottom-button.png?raw=true" width="482"/>

```yaml
type: custom:windrose-card
title: Wind direction
data_period:
  xhours_to_show: 200
  period_selector:
    location: top
    xactive_color: black
    xactive_bg_color: null
    xcolor: red
    xbg_color: black
    buttons:
      - hours: 1
        title: 1 hour
      - hours: 8
        title: 8 hours
      - hours: 24
        title: 1 day
        active: true
      - hours: 240
        title: 10 days
refresh_interval: 300
windspeed_bar_location: bottom
wind_direction_entity:
  entity: sensor.wind_direction_azimuth
  use_statistics: false
  direction_compensation: 0
windspeed_entities:
  - entity: sensor.wind_speed
    name: Speed
    speed_unit: auto
    windspeed_bar_full: false
    speed_range_beaufort: true
    current_speed_arrow: true
    use_statistics: false
  - entity: sensor.wind_gust
    name: Gust
    speed_unit: auto
    output_speed_unit: kph
    speed_range_beaufort: false
    windspeed_bar_full: true
    current_speed_arrow: true
    use_statistics: false
windrose_draw_north_offset: 0
current_direction:
  show_arrow: true
compass_direction:
  auto_rotate: true
  entity: input_number.compass
corner_info:
  top_left:
    label: Current gust
    unit: null
    entity: sensor.wind_gust
  top_right:
    label: Direction
    unit: °
    color: red
    entity: sensor.wind_direction_azimuth
  bottom_left:
    label: Compass
    unit: °
    entity: input_number.compass
cardinal_direction_letters: NESW
matching_strategy: direction-first
center_calm_percentage: true
direction_labels:
  cardinal_direction_letters: NESW
  show_cardinal_directions: true
  show_intercardinal_directions: true
  show_secondary_intercardinal_directions: true
  cardinal_directions_text_size: 60
  intercardinal_directions_text_size: 45
  secondary_intercardinal_directions_text_size: 30
```
