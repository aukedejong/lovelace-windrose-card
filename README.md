# Lovelace Windrose card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/aukedejonga)

Attention! Version (1.0.0 and higher) has breaking configuration changes. The easiest way is to just add the card and modify the generated configuration.

A Home Assistant Lovelace custom card to show wind speed and direction data in a Windrose diagram.


<img alt="Peview dark" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/example/windrose-example-north-orientation-dark.png?raw=true" width="482"/>
<img alt="Peview light" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/example/windrose-example-north-orientation-white.png?raw=true" width="482"/>

## Install

### HACS (recommended)

This card is available in [HACS](https://hacs.xyz/) (Home Assistant Community Store).
<small>*HACS is a third party community store and is not included in Home Assistant out of the box.*</small>

### Manual install

1. Download and copy `windrose-card.js` from the [latest release](https://github.com/aukedejong/ha-windrose-card/releases/latest) into your `config/www` directory.

2. Add the resource reference as decribed below.


### CLI install

1. Move into your `config/www` directory.

2. Grab `windrose-card.js`:

  ```
  $ wget https://github.com/aukedejong/lovelace-windrose-card/releases/latest/download/windrose-card.js
  ```

3. Add the resource reference as decribed below.

### Add resource reference

If you configure Lovelace via YAML, add a reference to `windrose-card.js` inside your `configuration.yaml`:

  ```yaml
  resources:
    - url: /local/lovelace-windrose-card/windrose-card.js?v=0.0.1
      type: module
  ```

Else, if you prefer the graphical editor, use the menu to add the resource:

1. Open any lovelace view
2. Select from the three dot menu - "edit dashboard"
3. The three dot menu is then replaced with another one, select the new three-dot menu (and do not select raw configuration editor*,
it will tell you when you try to save it with the resource section, that for adding resources you have to use the three-dot menu choice "Manage Resources" instead).
Select "Manage Resources"
4. Click "Add Resource",
5. Enter this for url: /hacsfiles/lovelace-windrose-card/windrose-card.js
6. Click the check box for "Javascript Module" and
7. Click the word "Create" in the corner to add the entry.

### Example configurations:

- Minimal: [click here](#minimal-configuration)
- Maximum: [click here](#maximum-configuration)


### Card options

| Name                                  |                  Type                   |           Default            | Required | Description                                                                                                                                                                                                                                                  |
|---------------------------------------|:---------------------------------------:|:----------------------------:|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type                                  |                 string                  |                              |    x     | `custom:windrose-card`.                                                                                                                                                                                                                                      |
| title                                 |                 string                  |                              |    -     | The card title.                                                                                                                                                                                                                                              |
| wind_direction_entity                 | [object](#Object-wind_direction_entity) |              x               |          | The wind direction entity, having directing in degrees as the state.                                                                                                                                                                                         |
| windspeed_entities      (NEW OPTIONS) |  [object](#Object-windspeed_entities)   |                              |    x     | One are more windspeed entities. Only the first is used for the windrose.                                                                                                                                                                                    |
| refresh_interval                      |                 number                  |             300              |    -     | Refresh interval in seconds                                                                                                                                                                                                                                  |
| hours_to_show (DEPRECATED)            |                 number                  |                              |    -     | Deprecated. Still works for now. Use the data period object instead.                                                                                                                                                                                         |
| data_period                           |      [object](#Object-data_period)      |                              |    x     | Configure what data period to query. See object data_period below. Only one options should be configured.                                                                                                                                                    |
| windspeed_bar_location                |                 string                  |            bottom            |    -     | Location of the speed bar graph: `bottom`, `right`                                                                                                                                                                                                           |
| center_calm_percentage                |                 boolean                 |             true             |    -     | Show the calm speed percentage in the center of windrose. Directions corresponding with speeds in the first speedrange are not displayed in a direction leave.                                                                                               |
| hide_windspeed_bar                    |                 boolean                 |            false             |    -     | Hides all windspeed bars.                                                                                                                                                                                                                                    |
| windspeed_bar_full (DEPRECATED)       |                 boolean                 |             true             |    -     | Deprecated. Moved to windspeed_entities object. When true, renders all wind ranges, when false, doesn't render the speed range without measurements.                                                                                                         |
| output_speed_unit (DEPRECATED)        |                 string                  |             mps              |    -     | Deprecated. Moved to windspeed_entities object. Windspeed unit used on card, see Windspeed unit options bellow.                                                                                                                                              |
| output_speed_unit_label (DEPRECATED)  |                 string                  |                              |    -     | Deprecated. Moved to windspeed_entities object. Overwrite the output speed units name, only for display.                                                                                                                                                     |
| speed_range_beaufort (DEPRECATED)     |                 boolean                 |             true             |    -     | Deprecated. Moved to windspeed_entities object. Uses the Beaufort speed ranges. The exact Beaufort ranges depend on the output windspeed unit. Default is true, when you want to show other speed unit on the bar graph, set this property to false.         |
| speed_range_step (DEPRECATED)         |                 number                  | depends on output speed unit |    -     | Deprecated. Moved to windspeed_entities object. Sets the speed range step to use. Not possible for output speed unit bft (Beaufort).                                                                                                                         |
| speed_range_max (DEPRECATED)          |                 number                  | depends on output speed unit |    -     | Deprecated. Moved to windspeed_entities object. Sets the speed range max to use. Not possible for output speed unit bft (Beaufort). For example: step 5, max 20 creates ranges: 0-5, 5-10, 10-15, 15-20, 20-infinity                                         |
| speed_ranges (DEPRECATED)             |     [object](#Object-speed_ranges)      | depends on output speed unit |    -     | Deprecated. Moved to windspeed_entities object. Define custom speedranges and colours.                                                                                                                                                                       |
| cardinal_direction_letters            |                 string                  |             NESW             |    -     | The cardinal letters used in the windrose. More info at [Cardinal direction letters](#Cardinal-direction-letters)                                                                                                                                            |
| wind_direction_count                  |                 string                  |              16              |    -     | How many wind direction the windrose can display, min. 4 max. 32                                                                                                                                                                                             |
| windrose_draw_north_offset            |                 number                  |              0               |    -     | At what degrees the north direction is drawn. For example, if you want the windrose north orientation the same as your properties north orientation                                                                                                          |
| compass_direction                     |   [object](#Ojbect-compass_direction)   |                              |    -     | Configuration for using a compass sensor to rotate the windrose to the correct direction, for use on for example a boat.                                                                                                                                     |
| current_direction                     |   [object](#Object-current_direction)   |                              |    -     | Shows the last reported wind direction with a red arrow on the wind rose.                                                                                                                                                                                    |
| corner_info             (NEW OPTIONS) |      [object](#Ojbect-corner_info)      |                              |    -     | Configuration for displaying entity states in the corners around the windrose.                                                                                                                                                                               |
| actions                      (NEW)    |        [object](#Ojbect-actions)        |                              |    -     | Configuration for HA actions, for example to display more-info popups.                                                                                                                                                                                       |
| matching_strategy        (NEW OPTION) |                 string                  |       direction-first        |    -     | How to match direction and speed measurements. Find a speed with each direction or a direction with each speed measurement. Options: `direction-first`, `speed-first`, `time-frame` or `full-time`. More info at [Matching strategies](#Matching-strategies) |
| background_image                      |                 string                  |                              |    -     | Displays a square image with the same size and exactly behind the outer circle of the windrose.                                                                                                                                                              |
| colors                                |        [object](#Object-colors)         |                              |    -     | Configure colors for different parts of the windrose and windspeedbar. See object Colors.                                                                                                                                                                    |
| log_level                             |                 string                  |             WARN             |    -     | Browser console log level, options: NONE, ERROR, WARN, INFO, DEBUG and TRACE                                                                                                                                                                                 |


### Object data_period

Only one of the options should be configured.

| Name             |  Type  | Default | Required | Description                                                                                                                                                                                      |
|------------------|:------:|:-------:|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| hours_to_show    | number |         |    -     | Show winddata for the last number of hours. Number higher then 0.                                                                                                                                |
| from_hour_of_day | number |         |    -     | Show winddata from the configured hours till now. 0 is midnight, so only data of the current day is used. If the set hour is not yet arrived, data from the previous day from that hour is used. |
| time_interval    | number |   60    |    -     | Time interval in seconds. Only used by the time-frame matching strategy. More info at [Matching strategies](#Matching-strategies)                                                                |


### Object wind_direction_entity

As of version 1.8.2 the direction unit is determined automatic.
When the state is numeric, a degree value is assumed. When the state is letters, the direction is determined with the letter combination.

| Name                                                  |  Type   | Default | Required | Description                                                                                                                                                                                                                               |
|-------------------------------------------------------|:-------:|:-------:|:--------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| entity                                                | string  |         |    x     | Wind direction entity                                                                                                                                                                                                                     |
| use_statistics                                        | boolean |  false  |    -     | Use Home Assistant 5 minute statistics data, works only if available for this entity. Can make fetching data faster.                                                                                                                      |
| direction_unit (not used anymore since version 1.8.2) | string  | degrees |    -     | Wind direction unit, options: degrees, letters. Where letters being N, NE upto 32 directions.                                                                                                                                             |
| direction_compensation                                | number  |    0    |    -     | Compensate the measured direction in degrees.                                                                                                                                                                                             |
| direction_letters                                     | string  |  NESWX  |    -     | Only used when the state consists of letters. Some weather integrations use language specific letters. With this property you can change the default letters used. See https://en.wikipedia.org/wiki/Points_of_the_compass for more info. |


### Object windspeed_entities

See [here](#Examples-using-custom-speed-ranges) for some example speed ragne configurations.

| Name                    |                  Type                  |           Default            | Required | Description                                                                                                                                                                                            |
|-------------------------|:--------------------------------------:|:----------------------------:|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| entity                  |                 string                 |                              |    x     | Wind speed entity.                                                                                                                                                                                     |
| name                    |                 string                 |                              |    -     | Label, displayed with the windspeed bar.                                                                                                                                                               |
| use_statistics          |                boolean                 |            false             |    -     | Use Home Assistant 5 minute statistics data, works only if available for this entity. Can make fetching data faster.                                                                                   |
| render_relative_scale   |                boolean                 |             true             |    -     | Renders the blocks in the windspeed bar relative to the speedrange size. Set to false evenly distributes the blocks.                                                                                   |
| speed_unit              | [string](#Windspeed-unit-options)      |             auto             |    -     | Windspeed unit of measurement, see Windspeed unit options bellow. When the speed_range_beaufort property is not set or set to true, the bars will show Beaufort ranges.                                |
| windspeed_bar_full      |                boolean                 |             true             |    -     | When true, renders all wind ranges, when false, doesn't render the speed range without measurements.                                                                                                   |
| output_speed_unit       |                 string                 |             mps              |    -     | Windspeed unit used on card, see Windspeed unit options bellow.                                                                                                                                        |
| output_speed_unit_label |                 string                 |                              |    -     | Overwrite the output speed units name, only for display.                                                                                                                                               |
| speed_range_beaufort    |                boolean                 |             true             |    -     | Uses the Beaufort speed ranges. The exact Beaufort ranges depend on the output windspeed unit. Default is true, when you want to show other speed unit on the bar graph, set this property to false.   |
| speed_range_step        |                 number                 | depends on output speed unit |    -     | Sets the speed range step to use. Not possible for output speed unit bft (Beaufort) .                                                                                                                  |
| speed_range_max         |                 number                 | depends on output speed unit |    -     | Sets the speed range max to use. Not possible for output speed unit bft (Beaufort). For example: step 5, max 20 creates ranges: 0-5, 5-10, 10-15, 15-20, 20-infinity                                   |
| speed_ranges            |     [object](#Object-speed_ranges)     | depends on output speed unit |    -     | Define custom speedranges and colours.                                                                                                                                                                 |
| dynamic_speed_ranges    | [object](#Object-dynamic_speed_ranges) |                              |    -     | Speed range step and max config, depending on the average wind speed                                                                                                                                   |

### Windspeed unit options:

Default is auto. When no windspeed unit is configured, the unit_of_measurement from Home Assisstant is used.

When your windspeed entity uses an unit of measurement not mentioned in the table below, please open an issue in GitHub.

| Name     |    Description     | Input | Output | Recognized HA units of measurements |
|----------|:------------------:|:-----:|:------:|-------------------------------------|
| auto     |     automatic      |   x   |        |                                     |
| Beaufort |     Beaufort       |   x   |        | Beaufort                            |
| mps      | metres per second  |   x   |   x    | mps, m/s                            |
| kph      | kilometer per hour |   x   |   x    | kph, km/h                           |
| mph      |   miles per hour   |   x   |   x    | mps, m/h                            |
| fps      |  feet per second   |   x   |   x    | fps, f/s                            |
| knot     |       knots        |   x   |   x    | knots, knts, kts                    |


### Object speed_ranges

| Name       |  Type  | Default | Required | Description                  |
|------------|:------:|:-------:|:--------:|------------------------------|
| from_value | number |         |    x     | Start speed of a speed range |
| color      | string |         |    x     | Color CSS value              |

<details>
<summary>It can be convenient to generate speed_ranges using Python. Credits to @reidprichard</summary>

Just enter in the name of any colormap from [this page](https://matplotlib.org/stable/gallery/color/colormap_reference.html),
along with your desired upper and lower bounds and the increment from one range to the next.

```python3
from matplotlib import colormaps
MIN_SPEED = 0
MAX_SPEED = 50
SPEED_INCREMENT = 10
COLORMAP_NAME = "YlGnBu" # See https://matplotlib.org/stable/gallery/color/colormap_reference.html
cmap = colormaps[COLORMAP_NAME]
count = (MAX_SPEED-MIN_SPEED)//SPEED_INCREMENT+1
print("speed_ranges:")
for i in range(count):
    f = i/(count-1)
    color_rgba = cmap(f)
    color_scaled = f"rgb({','.join([str(int(n*255)) for n in color_rgba[:3]])})"
    speed = MIN_SPEED + (MAX_SPEED - MIN_SPEED)*f
    print(f'  - from_value: {speed:.1f}\n    color: {color_scaled}')
```
</details>

### Object dynamic_speed_ranges

| Name          |  Type   | Default | Required | Description                                                          |
|---------------|:-------:|:-------:|:--------:|----------------------------------------------------------------------|
| average_above | number  |         |    x     | Average wind speed above this value. Option with 0 is required.      |
| step          | number  |         |    x     | Range steps to be used if average speed is above configurated value. |
| max           | number  |         |    x     | Max speed, used to calculate how many steps are used.                |

```yaml
windspeed_entities:
  - entity: sensor.wind_speed
    name: Speed
    speed_range_beaufort: false
    dynamic_speed_ranges:
      - average_above: 0
        step: 2
        max: 10
      - average_above: 10
        step: 4
        max: 20
      - average_above: 15
        step: 8
        max: 30
```

### Cardinal direction letters

Configuration property: cardinal_direction_letters

The property is used to configure what is displayed on the windrose.
It is not used to parse sensor states. The direction_letters property is used for that. 

- Version 1.10.0 and earlier:

  Only four letters are allowed. One letter for every direction in this order: north, east, south, west.
  Default value is NESW.

- Version 1.11.0 and later:

  New options:
    - Comma seperaated list, for example: 
      ```yaml
      cardinal_direction_letters: North,East,South,West
      ```
    - Empty string, to hide the labels.
      ```yaml
      cardinal_direction_letters: ''
      ```


### Object current_direction

Shows the current wind direction. The arrow is pointing too where to wind is flowing too.
When the sensor state is not a direction a red center dot is displayed.
Some sensors can have a value like CALM or VRB, indicating there is no direction measured.

| Name               |  Type   | Default | Required | Description                                                                                                                           |
|--------------------|:-------:|:-------:|:--------:|---------------------------------------------------------------------------------------------------------------------------------------|
| show_arrow         | boolean |  false  |    x     | Start speed of a speed range                                                                                                          |
| arrow_size         | number  |   50    |          | Size of the arrow                                                                                                                     |
| center_circle_size | number  |   30    |          | Size of the center circle, only when not using the center_calm_percentage. Then a red circle is displeyed around the center percante. |


### Ojbect compass_direction

This configuration is only needed if you want the windrose to rotate on an compass entity.
Usefull on for example a boat.
You can also make a helper number entity to rotate the windrose on manual input.

| Name        |  Type   | Default | Required | Description                                               |
|-------------|:-------:|:-------:|:--------:|-----------------------------------------------------------|
| auto_rotate | boolean |         |    x     | Use auto rotation, false to turn off.                     |
| entity      | string  |         |    x     | Compass or other direction entity, needs degrees as unit. |


### Ojbect corner_info

Configuration for displaying information in the corners around the windrose.

| Name         |  Type  | Default | Required | Description                          |
|--------------|:------:|:-------:|:--------:|--------------------------------------|
| top_left     | object |         |          | Configration for top left corner     |
| top_right    | object |         |          | Configration for top right corner    |
| bottom_left  | object |         |          | Configration for bottom left corner  |
| bottom_right | object |         |          | Configration for bottom right corner |

###  Object top_left, top_right, bottom_left and bottom_right

| Name              |  Type  |       Default        | Required | Description                                                                                                                   |
|-------------------|:------:|:--------------------:|:--------:|-------------------------------------------------------------------------------------------------------------------------------|
| label             | string |                      |          | Label                                                                                                                         |
| unit              | string |                      |          | Unit, displayed after the state, without a space. If you need space, add it to the config.                                    |
| color             | string | --primary-text-color |          | Color of the text.                                                                                                            |
| label_text_size   | number |          50          |          | The text size of the label.                                                                                                   |
| value_text_size   | number |          80          |          | The text size of the entity's state.                                                                                          |
| entity            | string |                      |    x     | State of the entity will be displayed                                                                                         |
| input_unit        | string |                      |          | Input unit, not automatically determined. See for options [Unit conversion](#Corner-Info-unit-conversion)                     |
| output_unit       | string |                      |          | Output unit                                                                                                                   |
| precision         | string |                      |          | Overwrites (if available) the precision of the entity. For rounding the value, for example after converting to an other unit. |
| direction_letters | string |        NESWX         |          | The cardinal direction letters use for winddirection conversion.                                                              |

### Corner Info unit conversion

Supported unit types for windspeed sensors:

| Config | Description        |
|--------|--------------------|
| bft    | Beaufort           |
| mps    | Meter per second   |
| kph    | Kilometer per hour |
| mph    | Miles per hour     |
| fps    | Feet per second    |
| knots  | Knots              |

Supported unit types for wind directions sensors:

| Config  | Description                                 |
|---------|---------------------------------------------|
| degrees | Direction in degreees, number from 0 to 359 |
| letters | Cardinal direction letters                  |


The units degrees and letters can only be used in combination with each other.
The card does not check the sensor type you are using. So, converting a light switch from degreees to letters will result in errors in the browsers console.

### Example corner_info yaml
```yaml
corner_info:
  top_left:
    label: Current gust speed
    unit: ' m/s'
    entity: sensor.gorredijk_wind_gust
    label_text_size: 40
    value_text_size: 30
    input_unit: kph
    output_unit: mps
    precision: 2
  top_right:
    label: Wind direction
    unit: °
    color: red
    entity: sensor.gorredijk_wind_direction_azimuth
    input_unit: degrees
    output_unit: letters
    direction_letters: NOZWX
  bottom_left:
    label: Compass
    unit: °
    entity: input_number.compass
```

### Ojbect actions

The tap and double-tap actions described in the Home Assistant documentation are supported. See link:
[Home Assistant action documentation](https://www.home-assistant.io/dashboards/actions/)

See example yaml below on how to use.
Btw, you can only configure actions for the first 2 speed bars.

| Name         |  Type  | Default | Required | Description                          |
|--------------|:------:|:-------:|:--------:|--------------------------------------|
| top_left     | object |         |          | Configration for top left corner     |
| top_right    | object |         |          | Configration for top right corner    |
| bottom_left  | object |         |          | Configration for bottom left corner  |
| bottom_right | object |         |          | Configration for bottom right corner |
| windrose     | object |         |          | Configration for the windrose        |
| speed_bar_1  | object |         |          | Configration for the first speedbar  |
| speed_bar_2  | object |         |          | Configration for the second speedbar |


Examples:
- **top_right**: toggle light
- **windrose**: navigate to an other page within Home Assitant.
- **buttom_left**: open an url in an other browser tab.
- **others**: show popup with more info about the entity.

### Example actions yaml
```yaml
actions:
  top_left:
    tap_action:
      entity: sensor.wind_gust
      action: more-info
  top_right:
    double_tap_action:
      entity: switch.light
      action: toggle
  windrose:
    tap_action:
      action: navigate
      navigation_path: /lovelace/floorplan
  bottom_right:
    tap_action:
      entity: sensor.wind_direction
      action: more-info
  bottom_left:
    tap_action:
      action: url
      url_path: https://www.home-assistant.io
  speed_bar_1:
    tap_action:
      entity: sensor.wind_speed
      action: more-info
  speed_bar_2:
    tap_action:
      entity: sensor.wind_gust
      action: more-info
```


### Matching strategies

The matching strategies can result in a different graph, depending on your sensors. How many state updates they get.

#### Direction first

Config value: 'direction-first'

Every direction state during the configuration time frame is used for the graph. The algorithm searches for the last speed state at the time of the direction state measurment.
It's possible not all speed state are used in the graph.

#### Speed first

Config value: 'speed-first'

Every speed state during the configuration time frame is used for the graph. The algorithm searches for the last direction state at the time of the direction state measurement.
It's possible not all direction states are used in the graph.

It's probably best to choose the sensor that reports the most updates as first.

#### Time frame

Config value: 'time-frame'

Extra data_period config: 'time-interval'

Time is leading. For every moment back in time (default every 60 seocnds) the direction and speed states are determined.
For data sources that only update state changes, this should result in a better graph.

For the first two strategies, a percentage in the graph is a percentage of the measurement count not a percentage of time.

### Full time

Config value: 'full-time'

For every speed measurement the wind direction at that timestamp is determined.
The same is done for every direction measurement.
Then for every measurement combination the amount of seconds that combination was active is determined.
With that data the wind rose percentages are calculated.

I think this strategy results in the best graph, but it possibly takes to much CPU power to calculate on some devices.

### Object colors
For some values the theme variable --primary-text-color is used. This is needed if HA switches theme and light/dark mode.
CSS color values are allowed.

| Name                         |  Type  |       Default        | Required | Description                                                                            |
|------------------------------|:------:|:--------------------:|:--------:|:---------------------------------------------------------------------------------------|
| rose_lines                   | string |  rgb(160, 160, 160)  |          | Circles, borders and the cross color                                                   |
| rose_direction_letters       | string | --primary-text-color |          | Direction letters color                                                                |
| rose_center_percentage       | string |         auto         |          | Center calm percentage color. Auto means black or white depending on background color. |
| rose_percentages             | string | --primary-text-color |          | Percentage legend color                                                                |
| rose_current_direction_arrow | string |         red          |          | Current direction arrow color                                                          |
| bar_border                   | string |  rgb(160, 160, 160)  |          | Bar border color                                                                       |
| bar_unit_name                | string | --primary-text-color |          | Unit name color                                                                        |
| bar_name                     | string | --primary-text-color |          | Entity name color                                                                      |
| bar_unit_values              | string | --primary-text-color |          | Unit value color                                                                       |
| bar_percentages              | string |         auto         |          | Percentage color. Auto means black or white depending on background color.             |
_
### Example colors yaml
```yaml
colors:
  rose_lines: 'rgb(0,255,0)'
  rose_direction_letters: 'yellow'
  rose_center_percentage: 'red'
  rose_percentages: 'blue'
  rose_current_direction_arrow: 'purple'
  bar_border: 'hsl(200, 100%, 60%)'
  bar_unit_name: 'purple'
  bar_name: 'yellow'
  bar_unit_values: 'blue'
  bar_percentages: 'orange'
```

## Examples using custom speed ranges

### Custom fixed length speed ranges:

Uses speed_range_step and speed_range_max.

<img alt="Pevriew" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/example/speedbar_step_5_max_25.png?raw=true" width="415"/>

```yaml
type: custom:windrose-card
title: Wind direction
data_period:
  hours_to_show: 24
windspeed_bar_full: true
wind_direction_entity:
  entity: sensor.wind_direction
windspeed_entities:
  - entity: sensor.wind_speed
    name: Average
    speed_range_beaufort: false
    output_speed_unit: mps
    speed_range_step: 5
    speed_range_max: 25
```

### When you want full control

Uses speed_ranges configuration, custom ranges and colors.

Always make sure there is a speedrange starting from 0, otherwise you can the this error:

```Speed is not in a speedrange: 0.6 unit: mps```

<img alt="Pevriew" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/example/speedbar_speed_ranges_custom.png?raw=true" width="412"/>

```yaml
type: custom:windrose-card
title: Wind direction
data_period:
  hours_to_show: 24
windspeed_bar_full: true
wind_direction_entity:
  entity: sensor.wind_direction
windspeed_entities:
  - entity: sensor.wind_speed
    name: Average
    output_speed_unit: mps
    speed_range_beaufort: false
    speed_ranges:
      - from_value: 0
        color: rgb(0,255,0)
      - from_value: 5
        color: yellow
      - from_value: 10
        color: hsl(200, 100%, 60%)
      - from_value: 20
        color: orange
      - from_value: 40
        color: red
```

## Some configuration examples

### Minimal configuration

```yaml
type: custom:windrose-card
title: Minimal configuration
data_period:
  hours_to_show: 4
wind_direction_entity:
  entity: sensor.wind_direction
windspeed_entities:
  - entity: sensor.fwind_speed
    name: Speed
current_direction:
  show_arrow: true
```

### Maximum configuration

```yaml
type: custom:windrose-card
title: Maximum configuration
data_period:
  hours_to_show: 200
refresh_interval: 300
windspeed_bar_location: bottom
wind_direction_entity:
  entity: sensor.wind_direction_letters
  use_statistics: false
  direction_compensation: 0
  direction_letters: NOZWX
windspeed_entities:
  - entity: sensor.wind_speed
    name: Speed
    speed_unit: auto
    use_statistics: false
    windspeed_bar_full: true
    output_speed_unit: mps
    speed_range_beaufort: true
  - entity: sensor.wind_gust
    name: Gust
    speed_unit: auto
    use_statistics: false
    windspeed_bar_full: false
    output_speed_unit: mps
    speed_range_beaufort: false
    speed_ranges:
      - from_value: 0
        color: rgb(0,255,0)
      - from_value: 2
        color: yellow
      - from_value: 5
        color: hsl(200, 100%, 60%)
      - from_value: 10
        color: orange
      - from_value: 15
        color: red
windrose_draw_north_offset: 10
current_direction:
  show_arrow: true
  arrow_size: 50
  center_circle_size: 30
compass_direction:
  auto_rotate: true
  entity: input_number.compass
corner_info:
  top_left:
    label: Current gust speed
    unit: " knots"
    entity: sensor.wind_gust
    label_text_size: 50
    value_text_size: 50
    inputUnit: kph
    outputUnit: knpts
  top_right:
    label: Wind direction
    unit: °
    color: red
    entity: sensor.wind_direction_azimuth
    inputUnit: degrees
    outputUnit: letters
  bottom_left:
    label: Compass
    unit: °
    entity: input_number.compass
    label_text_size: 40
  bottom_right:
    label: Outside light
    entity: light.wind_station_light
    label_text_size: 40
actions:
  top_left:
    tap_action:
      entity: sensor.wind_gust
      action: more-info
  top_right:
    double_tap_action:
      entity: switch.light
      action: toggle
  windrose:
    tap_action:
      action: navigate
      navigation_path: /lovelace/plattegrond-tablet
  bottom_right:
    tap_action:
      entity: sensor.rain
      action: more-info
  bottom_left:
    tap_action:
      action: url
      url_path: https://www.home-assistant.io
  speed_bar_1:
    tap_action:
      entity: sensor.temp_outside
      action: more-info
  speed_bar_2:
    tap_action:
      entity: sensor.max_temp_outside
      action: more-info
cardinal_direction_letters: N,E,S,W
matching_strategy: full-time
background_image: /hacsfiles/lovelace-windrose-card/bg.png
center_calm_percentage: true
colors:
  rose_lines: rgb(0,255,0)
  rose_direction_letters: yellow
  rose_center_percentage: red
  rose_percentages: blue
  rose_current_direction_arrow: purple
  bar_border: hsl(200, 100%, 60%)
  bar_unit_name: purple
  bar_name: yellow
  bar_unit_values: blue
  bar_percentages: auto
```

## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest versions of `windrose-card.js`.

If you have issues after updating the card, try clearing your browser cache.

If you have issues displaying the card in older browsers, try changing `type: module` to `type: js` at the card reference in `ui-lovelace.yaml`.

## License
This project is under the MIT license.
