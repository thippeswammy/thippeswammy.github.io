# Arduino Uno Computer Vision Projects

A collection of computer vision projects using Python (OpenCV, MediaPipe, YOLOv8) and Arduino Uno for hardware control.

## Project Structure
Each project is organized as:
- `arduino/`: Firmware for the Arduino Uno (`.ino` files).
- `python/`: PC-side control scripts (`.py` files).
- `assets/`: Project-specific models, data, and recorded media.

## Shared Resources
- `Resources/Models/`: Common Haar Cascades and AI models used across multiple projects.
- `Resources/Media/`: Shared test videos and images.

## Projects Overview
- **FaceDetection**: Detects multiple faces using Haar Cascades and sends movement commands to Arduino.
- **FireDetectionByColor**: Detects flames using HSV color filtering.
- **FireTracking**: Advanced YOLOv8-based fire detection and locking/tracking system.
- **GestureControlledLED**: Controls LEDs via hand gestures using MediaPipe.
- **HandGestureLED**: Specialized hand gesture recognition system for LED control.
- **SingleFaceTracking**: Tracks a single face and sends X/Y coordinates to Arduino for centering.
