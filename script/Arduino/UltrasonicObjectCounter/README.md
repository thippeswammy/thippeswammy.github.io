# Ultrasonic Object Counter

## Introduction
The **Ultrasonic Object Counter** is a system that uses two ultrasonic sensors placed **side by side (like human eyes)** to detect and count objects moving in front of them. This project is useful for tracking the number of objects or people entering and exiting a designated area. It can be applied in smart automation, security systems, inventory management, and people counting applications.

## Features
- **Counts objects in real-time** based on movement direction.
- **Uses two ultrasonic sensors** for accurate detection.
- **Controls an LED or any indicator** to signal object presence.
- **Serial monitor output** for debugging and tracking.
- **Low-cost and easy-to-implement** using an Arduino.

## Components Required
- 1 x Arduino Board (Uno, Mega, or similar)
- 2 x Ultrasonic Sensors (HC-SR04)
- 1 x LED or any output indicator
- Jumper wires
- Breadboard (optional)

## Circuit Diagram
- Place the two ultrasonic sensors **side by side**.
- Connect their **trig and echo pins** to separate digital pins on the Arduino.
- Connect the LED to another digital pin.
- Provide **5V power** and **GND** to all components.

## Wiring Instructions
| Component        | Arduino Pin |
|-----------------|------------|
| Ultrasonic Sensor 1 Trig | 2  |
| Ultrasonic Sensor 1 Echo | 3  |
| Ultrasonic Sensor 2 Trig | 4  |
| Ultrasonic Sensor 2 Echo | 5  |
| LED Indicator | 6  |
| VCC (Both Sensors) | 5V  |
| GND (Both Sensors) | GND |

## How It Works
1. **Ultrasonic Sensors Placement**
   - Two ultrasonic sensors are placed **side by side** to detect objects moving from **left to right** or **right to left**.
2. **Detection Logic**
   - If **Sensor 1 detects first**, it considers an object entering.
   - If **Sensor 2 detects first**, it considers an object exiting.
   - The counter is incremented or decremented accordingly.
3. **Light Control**
   - If objects are inside, the LED turns **ON**.
   - If no objects are inside, the LED turns **OFF**.
4. **Serial Output**
   - Displays real-time object count and status.


## Circuit Connection Images
![Connection Image 1](https://github.com/user-attachments/assets/b65aa515-74f1-48da-9055-29b064adcf41)
![Connection Image 2](https://github.com/user-attachments/assets/a8433de6-da40-4519-86c1-1ab59ac7eba9)
![Connection Image 3](https://github.com/user-attachments/assets/a665460e-24bc-463a-8114-78541977ee32)
![Connection Image 4](https://github.com/user-attachments/assets/00784307-5ae9-4f85-9f2e-405f5ebf0100)

## Working Video
![Working Video](https://github.com/user-attachments/assets/1469772b-18d2-4d29-8dd3-6dbba9e1463c)

## Applications
- **People Counting System**: Automate lights or track room occupancy.
- **Inventory Management**: Count products on a conveyor belt.
- **Security Systems**: Detect movements at entrances/exits.
- **Parking Lot Monitoring**: Count cars entering/exiting a parking area.

## Future Improvements
- Add an **LCD display** for live count visualization.
- Use **wireless communication (WiFi/Bluetooth)** to send data to a server.
- Improve **accuracy** with advanced filtering techniques.

## Conclusion
The **Ultrasonic Object Counter** is an easy-to-implement and cost-effective project that helps in counting objects and automating systems based on movement. It demonstrates the working principles of ultrasonic sensors and real-world applications of embedded systems.

---

**Author:** Thippeswamy k s 
