# Face Detection Project

This project uses Haar Cascade classifiers to detect faces in real-time from a webcam and sends movement commands to an Arduino-controlled motor system.

## Structure
- `arduino/`: Contains `FaceDetection.ino` for motor control.
- `python/`: Contains `FaceDetection.py` for computer vision and `communication.py` for serial handling.

## Usage
1. Connect your Arduino and update the COM port in `communication.py` if necessary.
2. Run `python/FaceDetection.py`.
