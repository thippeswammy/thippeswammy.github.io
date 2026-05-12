# TrafficSignal

## Description
This project simulates a traffic signal system using an Arduino-compatible microcontroller. The system controls two sets of LEDs, representing traffic lights for two directions. It cycles through Red, Yellow, and Green states with appropriate delays.

## Components Required
- Arduino-compatible board
- 6 LEDs (Red, Yellow, Green for each direction)
- Resistors (220Ω - 1kΩ recommended)
- Jumper wires
- Breadboard (optional)

## Pin Configuration
| Signal | LED Color | Pin |
|--------|----------|-----|
| Direction 1 | Red    | D0  |
| Direction 1 | Yellow | D1  |
| Direction 1 | Green  | D2  |
| Direction 2 | Red    | D5  |
| Direction 2 | Yellow | D6  |
| Direction 2 | Green  | D7  |

## Code Explanation
- The `setup()` function initializes the digital pins as outputs.
- The `loop()` function cycles through:
  1. **Green for Direction 1, Red for Direction 2** (5s)
  2. **Yellow for Direction 1, Yellow for Direction 2** (1s)
  3. **Red for Direction 1, Green for Direction 2** (5s)
- The cycle repeats indefinitely.

## Installation and Usage
1. Connect the LEDs and resistors according to the pin configuration.
2. Upload the provided code to the microcontroller using the Arduino IDE.
3. Observe the LED sequence simulating a traffic light system.

## Future Enhancements
- Add pedestrian crossing signals.
- Implement adaptive timing using sensors.
- Expand to a four-way intersection control system.
