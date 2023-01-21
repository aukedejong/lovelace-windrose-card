# Lovelace Windrose card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A minimalistic and customizable graph card for [Home Assistant](https://github.com/home-assistant/home-assistant) Lovelace UI.

The card works with entities from within the **sensor** & **binary_sensor** domain and displays the sensors current state as well as a line graph representation of the history.

![Preview](https://raw.githubusercontent.com/aukedejong/ha-windrose-card/main/example/windrose-example-dark.png?raw=true)

## Install

### HACS (recommended)

This card is available in [HACS](https://hacs.xyz/) (Home Assistant Community Store).
<small>*HACS is a third party community store and is not included in Home Assistant out of the box.*</small>

### Manual install

1. Download and copy `windrose-card.js` from the [latest release](https://github.com/kalkih/mini-graph-card/releases/latest) into your `config/www` directory.

2. Add the resource reference as decribed below.


### CLI install

1. Move into your `config/www` directory.

2. Grab `windrose-card.js`:

  ```
  $ wget https://github.com/kalkih/mini-graph-card/releases/download/v0.11.0/mini-graph-card-bundle.js
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

| Name                                      |  Type  | Default | Since  | Description                                                          |
|-------------------------------------------|:------:|:-------:|:------:|----------------------------------------------------------------------|
| type ***(required)***                     | string |         | v0.0.1 | `custom:windrose-card`.                                              |
| title                                     | string |         | v0.0.1 | The card title.                                                      |
| wind_direction_entity ***(required)***    | string |         | v0.0.1 | The wind direction entity, having directing in degrees as the state. |
| average_windspeed_entity ***(required)*** | string |         | v0.0.1 | The everage windspeed entity, windspeed as state. TODO unit info.    |
| gust_windspeed_entity                     | string |         | v0.0.1 | The gust windspeed entity, widnspeed as state.                       |
| hours_to_show                             | number |    4    | v0.0.1 | Show winddata for the last number of hours.                          |
| max_width                                 | number |  null   | v0.0.1 | Use to limit the with (and height) of the windrose.                  |
| windspeed_bar_location                    | string | bottom  | v0.0.1 | Location of the speed bar graph: `bottom`, `right`                   |
| direction_compensation                    | number |   0     | v0.0.1 | Compensate the measured direction in degrees.                        |
| cardinal_direction_letters                | string | NESW    | v0.0.1 | The cardinal letters used in the windrose.                           |


## Getting errors?
Make sure you have `javascript_version: latest` in your `configuration.yaml` under `frontend:`.

Make sure you have the latest versions of `mini-graph-card.js` & `mini-graph-lib.js`.

If you have issues after updating the card, try clearing your browser cache.

If you have issues displaying the card in older browsers, try changing `type: module` to `type: js` at the card reference in `ui-lovelace.yaml`.

## License
This project is under the MIT license.