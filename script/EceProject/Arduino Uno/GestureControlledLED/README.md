# Gesture Controlled LED

Control Arduino LEDs using hand gestures detected via MediaPipe.

## How it Works
1. MediaPipe detects hand landmarks from the webcam.
2. The script counts the number of extended fingers.
3. The count is sent to the Arduino via serial to light up a corresponding number of LEDs or trigger specific patterns.

## Structure
- `arduino/`: `GestureControlledLED.ino`.
- `python/`: `GestureControlledLED.py` and `communication.py`.
