# Lovelace Windrose card 
## Configuration examples

<img alt="Example for config yaml" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/examples/minimal-right.png?raw=true" width="482"/>

```yaml
type: custom:windrose-card
title: Minimal configuration
windspeed_bar_location: right
data_period:
  hours_to_show: 200
wind_direction_entity:
  entity: sensor.wind_direction_azimuth
windspeed_entities:
  - entity: sensor.wind_speed
    name: Speed
    windspeed_bar_full: false
    speed_range_beaufort: false
current_direction:
  show_arrow: true
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

<img alt="Peview bars bottom" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/examples/maximal-right-button-stats.png?raw=true" width="482"/>

```yaml
type: custom:windrose-card
title: Wind direction
data_period:
  xhours_to_show: 250
  period_selector:
    location: bottom
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
windspeed_bar_location: right
circle_legend_text_size: 30
background_image: /hacsfiles/lovelace-windrose-card/bg.png
wind_direction_entity:
  entity: sensor.wind_direction_azimuth
  use_statistics: false
  direction_compensation: 0
windspeed_entities:
  - entity: sensor.wind_speed
    name: Speed
    speed_unit: auto
    output_speed_unit: kph
    windspeed_bar_full: false
    speed_range_beaufort: true
    current_speed_arrow: true
    render_relative_scale: false
    use_statistics: false
    xspeed_ranges:
      - from_value: 0
        color: rgb(0,255,0)
      - from_value: 5
        color: blue
      - from_value: 10
        color: hsl(200, 100%, 60%)
      - from_value: 20
        color: orange
      - from_value: 40
        color: red
  - entity: sensor.wind_gust
    name: Gust
    speed_unit: auto
    output_speed_unit: kph
    speed_range_beaufort: false
    windspeed_bar_full: true
    current_speed_arrow: true
    use_statistics: false
text_blocks:
  top:
    text: |-
      <table>
          <tr>
              <td>Direction measure’s:</td>
              <td>${direction-count}</td>
              <td>Minimal speed:</td>
              <td>${min-speed}</td>
          </tr>
          <tr>
              <td>Speed measure’s.:</td>
              <td>${speed-1-count}</td>
              <td>Maximum speed:</td>
              <td>${max-speed}</td>
          </tr>
          <tr>
              <td>Match count:</td>
              <td>${match-count}</td>
              <td>Average speed:</td>
              <td>${average-speed}</td>
          </tr>
          <tr>
              <td>Period hours</td>
              <td>${period-hours}</td>
              <td>Calm percentage:</td>
              <td>${calm-percentage}%</td>
          </tr>
          <tr>
              <td>Temperature</td>
              <td>${weather.gorredijk.temperature} °C</td>
              <td>Wind speed</td>
              <td>${sensor.wind_speed} Bft</td>
          </tr>

          <tr>
              <td>First match time</td><td colspan="2">${date-first-match}, ${time-first-match}</td>
          </tr>
          <tr>
              <td>Last match time</td><td colspan="2">${date-last-match}, ${time-last-match}</td>
          </tr>
      </table>
    text_color: gray
    text_size: 14
  xbottom:
    text: |-
      Direction measurements ${direction-count}<br/>
      Speed measurements ${speed-1-count}
    text_color: gray
    text_size: 16
windrose_draw_north_offset: 0
current_direction:
  show_arrow: true
  hide_direction_below_speed: 2
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
matching_strategy: full-time
center_calm_percentage: true
direction_labels:
  cardinal_direction_letters: NESW
  show_cardinal_directions: true
  show_intercardinal_directions: true
  show_secondary_intercardinal_directions: true
  cardinal_directions_text_size: 60
  intercardinal_directions_text_size: 45
  secondary_intercardinal_directions_text_size: 30
colors:
  rose_percentages: auto

```
