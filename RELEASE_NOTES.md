-------
v2.0.0
Breaking changes:
- Changed data_period object, period_selector is replaced by buttons_config on root level.
  The data_period object only contains period proeprties.
  Statistics can also be turned on here.
- Root level options matching_strategy is a object now, with the following options:
    - name:  name of matching strategy, the old value.
    - time_interval:  before this was part of data_period. Only used by strategy time_frame.
    - log_measurement_counts: before this was part of data_period.
- Removed deprecated root level options:
    - hours_to_show
    - windspeed_bar_full
    - output_speed_unit
    - output_speed_unit_label
    - speed_range_beaufort
    - speed_range_step
    - speed_range_max
    - speed_ranges
    - cardinal_direction_letters
- Moved root level options to rose_config object:
    - wind_direction_count
    - background_image
    - circle_legend_text_size
    - windrose_draw_north_offset
    - center_calm_percentage
    - cirlce_count
    - outer_circle_percentage
- Removed render_relative_scale in object windspeed_entities, replaced by bar_render_scale with options: absolute, windspeed_relative and percentage_relative.
  Percentage_relative is the new options.
- In cornet info, when displaying cardinal direction letters, converted from degrees, now default uses only NESW letters, no X.

Features:
- Button to toggle between the speed sensors used for the rose graph, fixes #172.
- Button to shift the time period hours back or forward in time.
- Button to start an animation of windrose over time.
- Windbar scale options added: percentage relative, fixed #167.
- Rose legend circle percentages configurable, default auto.
- Added use_for_windrose in windspeed_entities object.
- New data_period option: preset_period
  Possible options:
    - today
    - yesterday
    - last_7_days
    - last_30_days
    - this_week
    - last_week
    - this_month
    - last_month
    - last_6_months
    - this_year
    - last_year
- The data_period properties can be used in the buttons config. With a button click you can change the period and statistics config of the data used. Fixes #174
- New template vars: start_date, start_time, end_date, end_time
  The exact start and end date time of the active period.
- Rename template vars: period-hours and period-minutes to match-period-hours and match-period-minutes. 
- New template vars: period-hours and period-minutes, now containing the whole period, not only that of the first and last matched measurement.
- When there is no value available for an template variable, the placeholder is removed from the template.
- Improved error handling, when no measurements are found.
- Button border color can now be configured. Fixes #176
- Default generated config uses more features.
- All removed/moved config options should show an error message with helpful info, to help with the upgrade.

v1.26.1
Fixes:
- When current speed arrow is disabled, the current direction arrow did not work. Fixed. Thanks @rocket

v1.26.0
Features:
- Added time period option, from hours ago to a hours ago.
- Added statistics to be used in text blocks:
  - median-speed
  - q1-speed
  - q3-speed
  - iqr-range
  - p90-speed
  - wind-description

Fixes:
- Rounding of speed values in the windbar.

All credits go to David Marton, thanks for your work!

v1.25.1
Fix:
- Fix problem: Multiple background image elements added to HTML, when using period buttons.

v1.25.0
Feature:
- Add text above and below the windrose with entity states or specific values about the data used for the windrose.

v1.24.1
Fix:
- Possible fix for older HA versions.

v1.24.0
Feature:
- Added auto option for rose percentage text color, this is also the default.
  The text color depends on the background, making the text more readable when a windrose leave is the text background.

v1.23.5
Fixes:
- Current wind direction center circle is now drawn on top.
- Current wind direction hide_direction_below_speed option was not working in some cases because the direction was not updated when the speed changes.
- Improved efficiency during card start up.

v1.23.4
Fixes:
- Auto text color switching when light/dark theme switches automatically. Refresh was needed before.

v1.23.3
Fixes:
- Current direction arrow position fixe d.
- Fixed error in console when not using actions.~~

v1.23.2
Fixes:
- Touch actions not working correctly for the speed bars.

v1.23.1
Fixes:
- Cropping of speed labels in certain conditions when using vertical bars.

v1.23.0
Feature:
- Animated rendering of the windrose leaves and the windbars. (can be disabled)
- Wind speed compensation using a factor or shift. Fixes #138
- Circle percentages text size configurable.
Fixes:
- Speed label space calculation fix when using vertical speed bars.


v1.22.0
Features:
- Hold action support
- Support for new state_class for directional sensors.
  Since HA 2025.4 the new state class measurement_angle is introduced.
  With this change we have long term statistics (LTS) for wind direction data.


v1.21.1
Fix:
- Top margin for corner info label text increased.

v1.21.0

Features:
- Text sizes in speed bars configurable, fixes #132
- Current speed arrow location can now also be rendered on the other side of the bar, fixes #139

Fix:
- Refactoring dimension calculation code, fixes #143
- When using more than 16 rose leaves, render the space between the leaves smaller.
- When there is no history data returned by HA, a clear error message is logged in the console.

Example configuration with new options:

 ```yaml
windspeed_entities:
  - entity: sensor.wind_speed
    name: Speed
    speed_unit: auto
    output_speed_unit: kph
    windspeed_bar_full: false
    speed_range_beaufort: false
    current_speed_arrow: true
    current_speed_arrow_size: 50
    current_speed_arrow_location: below
    use_statistics: false
    bar_label_text_size: 40
    bar_speed_text_size: 40
    bar_percentage_text_size: 40
  ```

Thank you all for reporting the issues and feature requests.


v1.20.1
Fix:
- Compass direction as heading, now the current wind direction is also compensated.

v1.20.0
Feature:
- Using compass auto rotation, it's now also possible to use it as heading direction instead of north direction. Thanks @alnavasa
  ```
  compass_direction:
    auto_rotate: true
    as_heading: true
    entity: input_number.compass
  ```
Fixes:
- Added speed unit alias mi/h for auto recognition.
- Made speed unit recognition case-insensitive.


v1.19.1
Fixes:
- The second windspeedbar used the wrong speed unit converter.


Finally implemented a feature requested back in 2023. It was a big one, needed a lot of code changes.
v1.19.0
Feature:
- Show current wind speed arrow on the legend bars, implements #49 
Fixes:
- When not showing all speed ranges in the legend bar (windspeed_bar_full: false), render_relative_scale did not work.
- Refactored bar render code.


v1.18.1
Fix:
- In corner info, when converting degrees to cardinal direction letters, some direction where not converted correctly. Thanks deanfourie1. Fixes #137

v1.18.0
Feature:
- Background and text color configurable for the inactive data period select buttons.
- Card width options for use in sections layout. Experimental, please give me feedback. I don't completely understand the inner workings of the sections layout view.

v1.17.0
Features:
- Current wind direction arrow hidden and show center circle/dot when wind speed is below configured value.

v1.16.2
Fix:
- deprecated root level hours_to_show property works again.

v1.16.1
Fix:
- range selector button layout fixes when using a more buttons that fit on a row.

v1.16.0

Finally implemented a very long requested feature.
Please report bugs and feature request in GitHub.
Feature:
- Time range selector buttons. Fixes #41

v1.15.2
Fixes:
- Top overflow error, fixes #131
  Only visible when title is not used.

v1.15.1
Fixes:
- Config check for conflicting speed range configurations
- When the average wind speed is zero, first dynamic speed range was not selected.
- Readme errors corrected
- When using log_measurement_counts, also log average wind speed.

v1.15.0
Features:
- Statistics period can be configured. Long-term statistics can now be used by te card.
- The windspeed unit can be auto determined for weather entity's. Reading attribute wind_speed_unit. Fixes #129
- When the windspeed unit can not be auto determined, an error message will be display on the card. Fixes #129
- Measurement and match statistics can be logged to the console (F12), set this property to true: log_measurement_counts in data_period.
  In a future release these stats and counts can be displayed on the card.


v1.14.2
Fixes:
- Fix in error message, using wrong property name. Thanks @fishter.

v1.14.1
Fixes:
- Windrose circles rendering fixed when not using center calm percentage.

v1.14.0
Features:
- Attribute support for compass, corner info, wind direction and wind speed entities.
- Improved feedback about configuration errors in the card. Before some error where only reported in the browsers console.
- Added paragraph about data retention in the readme.


v1.13.0
Features:
- Intercardinal and secondary intercardinal direction labels can be displayed.
- Labels based on the four direction letters or custom values for all 16 directions.
- Colors and sizes adjustable, per direction group: cardinal, intercardinal en secondary intercardinal.
Fixes:
- Updates and cleanup libraries/dependencies used by the card.
  Possibly fixes the Failed to execute 'define' on 'CustomElementRegistry' errors some people get.


v1.12.8
Fix:
- Only animate current winddirection indicator when it's state changes, not when windrose is redrawn or on initial render.

v1.12.7
Fix:
- 1 Beaufort kph speed limit fix, should be 0 to 1 kph.

v1.12.6
Fixes:
- Improved error message about cardinal_direction_letters config. Fixes #114
- Position label windspeed Beaufort 12 is now centered. Fixes #116

v1.12.5
Fix:
- fallback to deprecated configuration for speed_range_max (root level)s

v1.12.4
Fix:
- render background image in the background, not in front of other elements.

v1.12.3
Fix:
- added mouse hoverhand cursor to action area, forgot one.

v1.12.2
Fixes:
- added mouse hover hand cursor to action area's.
- Readme fix: center_calm_percentage option is not available within speed unit config.

v1.12.1
Fixes:
- Dynamic speed range fixes, had multiple bugs adn design errors.

v1.12.0
Features:
- New matching strategy 'full-time'. See Readme for details. Fixes #102
- Corner info label and value text size configurable. Fixes #104
- Added CSS classes to the corner info labels and values. Can be used to modify CSS with card-mod. Fixes #104
- Moved a few settings from global to windbar specific. Fixes #60
  - Speed ranges customizations.
  - Rendering full or partial.
  - Using Beaufort scale.
  - Output speed unit and label.
- Tap action support for the corners, windrose and speedbars. Fixes #56
- Corner info sensor unit conversion for direction and speed sensor. Fixes #100, #103
  - Direction sensor units: degrees, letters
  - Wind speed sensor units: bft, mps, kph, mph, fps and knots
- Dynamic speed ranges depending on average wind speed. Fixes #93

v1.11.7
Fixes:
- Initial cardinal direction letters configuration when adding card now works. Fixes #101

v1.11.6
Fixes:
- Small fix in measurement matching
- Margin calculation when speedbars are hidden. Fixes #97
- Background image position fixed when using longer cardinal direction labels. 

v1.11.5

- Entity config check reverted, check if state is available in states array.

v1.11.4

Fixes:
- Text position error on Safari/MacOS/iOS, Tspan was added by the SVG library, causing padding issues.

v1.11.3

Fixes:
- Changed current wind direction arrow animation to take the shortest route to next wind direction. Fixes #94
- Change from buggy Snap SVG library to SVG.js library. Needed for above fix.
- Changed text alignments in the speed bar.
- Corner info now using configured display precision. Fixes #92

v1.11.2
Fix: Data_period Cconfig check fix

v1.11.1

Fix: handles no wind periods better. Fixes #86

v1.11.0

Feature:
- Possible to display words instead of letters on the cardinal direction points on the windrose. Fixes #82
  Its not perfect, because of the margin used in combination with auto rotation and the display of corner info.
  Some text can overlap.

Fixes:
- Matching strategy time-frame did not work for direction sensor using letters. Fixes: #64
- The direction_letters property wasn't used, instead the cardinal_direction_letters property was also used to parse states.

v1.10.0

Features:
- Background image support. Fixes #54
- New match strategy: time_frame. Fixes #64
