# FaceTrackingSystem

## Description

This project demonstrates a real-time **face-tracking system** using **OpenCV** and **Arduino-controlled servo motors**. A webcam captures live video, detects faces using a **Haar Cascade classifier**, and sends face coordinates to an **Arduino board** via **serial communication**. The Arduino then adjusts two **servo motors** (horizontal and vertical) to keep the detected face centered.

## Components Required

- **Arduino-compatible board** (e.g., Arduino Uno)
- **2 Servo Motors** (for horizontal and vertical movement)
- **USB Camera** (or built-in webcam)
- **Jumper Wires**
- **Computer with Python and OpenCV**

## Pin Configuration

| Component              | Arduino Pin  |
|------------------------|-------------|
| **Horizontal Servo**   | 10          |
| **Vertical Servo**     | 9           |
| **Serial Communication** | USB to PC  |

## Code Explanation

### **Python Script (FaceTrackingSystem.py)**
- Uses **OpenCV** to detect faces in real-time.
- Converts frames to grayscale for better detection.
- Calculates **face center coordinates** and sends them to the Arduino via **serial communication**.
- Draws **bounding boxes** and a **center marker** on detected faces.
- Adjusts **servo movements** based on face position.

### **Arduino Code (face_tracking_arduino.ino)**
- Reads face position data from **serial input**.
- Uses the **map() function** to convert coordinates into **servo angles**.
- Moves servos to adjust the camera **left/right** and **up/down** to keep the face centered.
- Implements a **position memory** to prevent unnecessary movements.

## Installation and Usage

### **1. Setup the Hardware**
- Connect **Horizontal Servo** to **Pin 10** and **Vertical Servo** to **Pin 9**.
- Connect the **Arduino to the computer via USB**.
- Ensure the **camera is properly connected**.

### **2. Upload Arduino Code**
- Open the **Arduino IDE**.
- Upload **face_tracking_arduino.ino** to the Arduino board.

### **3. Install Python Dependencies**
Install required libraries:
```bash
pip install opencv-python pyserial
```

### **4\. Run the Face Tracking Script :**

`python FaceTrackingSystem.py` 

### **5\. Observe the Face Tracking**

*   The webcam should detect faces.
*   The **servos will adjust the camera** to follow the detected face.
*   Press **'q'** to stop the program.

Future Enhancements
-------------------

*   **Improved Face Tracking Algorithm**: Use **DNN-based face detection** for better accuracy.
*   **Multiple Face Detection**: Implement logic to prioritize tracking of **nearest** or **largest** face.
*   **Wireless Communication**: Use **Bluetooth or Wi-Fi** instead of serial connection.
*   **Mobile App Integration**: Allow face tracking control from a smartphone.

Troubleshooting
---------------

*   If **the servos are not moving**, check **wiring and pin connections**.
*   If **face detection is slow**, reduce the frame size in **OpenCV**.
*   If **serial data is not received**, check the **COM port** settings.

Acknowledgments
---------------

*   **OpenCV**: For face detection using Haar cascades.
*   **Arduino Community**: For resources on servo control.
*   **PySerial**: For handling serial communication.
