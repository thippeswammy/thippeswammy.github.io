# Fire Detection By Color

A simple fire detection system that uses HSV (Hue, Saturation, Value) color filtering to identify flames in a video stream.

## Structure
- `arduino/`: Firmware for the Arduino receiving fire detection signals.
- `python/`: Contains `FireDetectionByColor.ino.py` which handles the webcam stream and color filtering logic.

## Logic
The script converts the webcam frame to HSV color space and applies a mask for typical flame colors (Yellow/Orange/Red). It then calculates the center of the largest contour to determine movement commands.
