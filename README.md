# Lovelace Windrose card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)

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


### Card options

| Name                         |  Type   |           Default            | Required | Description                                                                                                                                                                                          |
|------------------------------|:-------:|:----------------------------:|:--------:|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| type                         | string  |                              |    x     | `custom:windrose-card`.                                                                                                                                                                              |
| title                        | string  |                              |    -     | The card title.                                                                                                                                                                                      |
| wind_direction_entity        | object  |                              |    x     | The wind direction entity, having directing in degrees as the state.                                                                                                                                 |
| windspeed_entities           | object  |                              |    x     | One are more windspeed entities. Only the first is used for the windrose.                                                                                                                            |
| refresh_interval             | number  |             300              |    -     | Refresh interval in seconds                                                                                                                                                                          |
| hours_to_show (DEPRECATED)   | number  |                              |    -     | Deprecated. Still works for now. Use the data period object instead.                                                                                                                                 |
| data_period                  | object  |                              |    x     | Configure what data period to query. See object data_period below. Only one options should be configured.                                                                                            |
| windspeed_bar_location       | string  |            bottom            |    -     | Location of the speed bar graph: `bottom`, `right`                                                                                                                                                   |
| windspeed_bar_full           | boolean |             true             |    -     | When true, renders all wind ranges, when false, doesn't render the speed range without measurements.                                                                                                 |
| hide_windspeed_bar           | boolean |            false             |    -     | Hides all windspeed bars.                                                                                                                                                                            |
| output_speed_unit            | string  |             mps              |    -     | Windspeed unit used on card, see Windspeed unit options bellow.                                                                                                                                      |
| output_speed_unit_label      | string  |                              |    -     | Overwrite the output speed units name, only for display.                                                                                                                                             |
| center_calm_percentage       | boolean |             true             |    -     | Show the calm speed percentage in the center of windrose. Directions corresponding with speeds in the first speedrange are not displayed in a direction leave.                                       |
| speed_range_beaufort         | boolean |             true             |    -     | Uses the Beaufort speed ranges. The exact Beaufort ranges depend on the output windspeed unit. Default is true, when you want to show other speed unit on the bar graph, set this property to false. |
| speed_range_step             | number  | depends on output speed unit |    -     | Sets the speed range step to use. Not possible for output speed unit bft (Beaufort) .                                                                                                                |
| speed_range_max              | number  | depends on output speed unit |    -     | Sets the speed range max to use. Not possible for output speed unit bft (Beaufort). For example: step 5, max 20 creates ranges: 0-5, 5-10, 10-15, 15-20, 20-infinity                                 |
| speed_ranges                 | object  | depends on output speed unit |    -     | Define custom speedranges and colours.                                                                                                                                                               |
| cardinal_direction_letters   | string  |             NESW             |    -     | The cardinal letters used in the windrose.                                                                                                                                                           |
| wind_direction_count         | string  |              16              |    -     | How many wind direction the windrose can display, min. 4 max. 32                                                                                                                                     |
| windrose_draw_north_offset   | number  |              0               |    -     | At what degrees the north direction is drawn. For example, if you want the windrose north orientation the same as your properties north orientation                                                  |
| compass_direction            | object  |                              |    -     | Configuration for using a compass sensor to rotate the windrose to the correct direction, for use on for example a boat.                                                                             |
| show_current_direction_arrow | boolean |            false             |    -     | Shows the last reported wind direction with a red arrow on the wind rose.                                                                                                                            |
| matching_strategy            | string  |       direction-first        |    -     | How to match direction and speed measurements. Find a speed with each direction or a direction with each speed measurement. Options: `direction-first`, `speed-first`                                |
| colors                       | object  |                              |    -     | Configure colors for different parts of the windrose and windspeedbar. See object Colors.                                                                                                            |
| log_level                    | string  |             WARN             |    -     | Browser console log level, options: NONE, ERROR, WARN, INFO, DEBUG and TRACE                                                                                                                         |


#### Object data_period

Only one of the options should be configured.

| Name                   |  Type  | Default | Required | Description                                                                                                                                                                                      |
|------------------------|:------:|:-------:|:--------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| hours_to_show          | number |         |    -     | Show winddata for the last number of hours. Number higher then 0.                                                                                                                                |
| from_hour_of_day       | number |         |    -     | Show winddata from the configured hours till now. 0 is midnight, so only data of the current day is used. If the set hour is not yet arrived, data from the previous day from that hour is used. |

#### Object wind_direction_entity

| Name                   |  Type   | Default | Required | Description                                                                                                                                                                                                                             |
|------------------------|:-------:|:-------:|:--------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| entity                 | string  |         |    x     | Wind direction entity                                                                                                                                                                                                                   |
| use_statistics         | boolean |  false  |    -     | Use Home Assistant 5 minute statistics data, works only if available for this entity. Can make fetching data faster.                                                                                                                    |
| direction_unit         | string  | degrees |    -     | Wind direction unit, options: degrees, letters. Where letters being N, NE upto 32 directions.                                                                                                                                           |
| direction_compensation | number  |    0    |    -     | Compensate the measured direction in degrees.                                                                                                                                                                                           |
| direction_letters      | string  |  NESWX  |    -     | Only used when direction_unit is 'letters'. Some weather integrations use language specific letters. With this property you can change the default letters used. See https://en.wikipedia.org/wiki/Points_of_the_compass for more info. |


#### Object windspeed_entities

| Name                  |  Type   | Default | Required | Description                                                                                                          |
|-----------------------|:-------:|:-------:|:--------:|----------------------------------------------------------------------------------------------------------------------|
| entity                | string  |         |    x     | Wind speed entity  .                                                                                                 |
| name                  | string  |         |    -     | Label, displayed with the windspeed bar.                                                                             |
| use_statistics        | boolean |  false  |    -     | Use Home Assistant 5 minute statistics data, works only if available for this entity. Can make fetching data faster. |
| render_relative_scale | boolean |  true   |   -      | Renders the blocks in the windspeed bar relative to the speedrange size. Set to false evenly distributes the blocks. |
| speed_unit            | string  |  auto   |    -     | Windspeed unit of measurement, see Windspeed unit options bellow. When the speed_range_beaufort property is not set or set to true, the bars will show Beaufort ranges.                                                     |


#### Windspeed unit options:

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


#### Object speed_ranges

| Name       |  Type  | Default | Required | Description                  |
|------------|:------:|:-------:|:--------:|------------------------------|
| from_value | number |         |    x     | Start speed of a speed range |
| color      | string |         |    x     | Color CSS value              |


#### Ojbect compass direction
This configuration is only needed if you want the windrose to rotate on an compass entity.
Usefull on for example a boat.
You can also make a helper number entity to rotate the windrose on manual input.

| Name        |  Type   | Default | Required | Description                                               |
|-------------|:-------:|:-------:|:--------:|-----------------------------------------------------------|
| auto_rotate | boolean |         |    x     | Use auto rotation, false to turn off.                     |
| entity      | string  |         |    x     | Compass or other direction entity, needs degrees as unit. |


#### Object colors
For some value the theme variable --primary-text-color is used. This is needed if HA switches theme
light/dark mode.
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
#### Example colors yaml
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

## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest versions of `windrose-card.js`.

If you have issues after updating the card, try clearing your browser cache.

If you have issues displaying the card in older browsers, try changing `type: module` to `type: js` at the card reference in `ui-lovelace.yaml`.

## License
This project is under the MIT license.
