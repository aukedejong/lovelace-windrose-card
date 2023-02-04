# Lovelace Windrose card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A Home Assistant Lovelace custom card to show wind speed and direction data in a Windrose diagram.


<img alt="Pevriew" src="https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/example/windrose-example-dark.png?raw=true" width="482"/>

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
  $ wget https://github.com/aukedejong/lovelace-windrose-card/releases/download/latest/windrose-card.js
  ```

3. Add the resource reference as decribed below.

### Add resource reference

If you configure Lovelace via YAML, add a reference to `windrose-card.js` inside your `configuration.yaml`:

  ```yaml
  resources:
    - url: /local/windrose-card.js?v=0.0.1
      type: module
  ```

Else, if you prefer the graphical editor, use the menu to add the resource:

1. Make sure, advanced mode is enabled in your user profile (click on your user name to get there)
2. Navigate to Configuration -> Lovelace Dashboards -> Resources Tab. Hit orange (+) icon
3. Enter URL `/local/windrose-card.js` and select type "JavaScript Module".
   (Use `/hacsfiles/windrose-card/windrose-card.js` and select "JavaScript Module" for HACS install)
4. Restart Home Assistant.


### Card options

| Name                       |  Type   | Default | Required | Description                                                                                          |
|----------------------------|:-------:|:-------:|:--------:|------------------------------------------------------------------------------------------------------|
| type                       | string  |         |    x     | `custom:windrose-card`.                                                                              |
| title                      | string  |         |    -     | The card title.                                                                                      |
| wind_direction_entity      | string  |         |    x     | The wind direction entity, having directing in degrees as the state.                                 |
| windspeed_entities         | object  |         |    x     | One are more windspeed entities. Only the first is used for the windrose. (for now)                  |
| refresh_interval           | number  |   300   |    -     | Refresh interval in seconds                                                                          |
| hours_to_show              | number  |    4    |    -     | Show winddata for the last number of hours.                                                          |
| max_width                  | number  |  null   |    -     | Use to limit the with (and height) of the windrose.                                                  |
| windspeed_bar_location     | string  | bottom  |    -     | Location of the speed bar graph: `bottom`, `right`                                                   |
| windspeed_bar_full         | boolean |  true   |    -     | When true, renders all wind ranges, when false, doesn't render the speed range without measurements. |
| wind_direction_unit        | string  | degrees |    -     | Wind direction unit, options: `degrees`, `letters`.  Where letters being N, NE upto 32 directions.   |
| input_speed_unit           | string  |   mps   |    -     | Windspeed unit of measurement, options: `mps`, `kph`, `mph`, `knots`.                                |
| output_speed_unit          | string  |   bft   |    -     | Windspeed unit used on card, options: `mps`, `kph`, `mph`, `knots`, `bft`.                           |
| direction_compensation     | number  |    0    |    -     | Compensate the measured direction in degrees.                                                        |
| cardinal_direction_letters | string  |  NESW   |    -     | The cardinal letters used in the windrose.                                                           |
| wind_direction_count       | string  |   16    |    -     | How many wind direction the windrose can display, min. 4 max. 32                                     |

#### Object windspeed_entities

| Name   |  Type  | Default | Required | Description       |
|--------|:------:|:-------:|:--------:|-------------------|
| entity | string |         |    x     | Wind speed entity |
| name   | string |         |    x     | Label             |


## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest versions of `windrose-card.js`.

If you have issues after updating the card, try clearing your browser cache.

If you have issues displaying the card in older browsers, try changing `type: module` to `type: js` at the card reference in `ui-lovelace.yaml`.

## License
This project is under the MIT license.
