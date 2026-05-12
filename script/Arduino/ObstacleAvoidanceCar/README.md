# ObstacleAvoidanceCar

## Description

This project demonstrates an autonomous obstacle-avoidance robotic car using an Arduino and the **Adafruit Motor
Shield (AFMotor Library)**. The car moves forward and uses an **ultrasonic sensor (HC-SR04)** to detect obstacles. If an
obstacle is too close, the car stops and moves backward before deciding the next action.

## Components Required

- Arduino-compatible board (e.g., Arduino Uno)
- **Adafruit Motor Shield**
- **4 DC Motors** (for car movement)
- **HC-SR04 Ultrasonic Sensor** (for obstacle detection)
- **Jumper Wires**
- **9V or 12V Battery Pack** (for power supply)

## Pin Configuration

| Component                  | Pin            |
|----------------------------|----------------|
| **Ultrasonic Sensor Trig** | 10             |
| **Ultrasonic Sensor Echo** | 9              |
| **Front Left Motor** (M1)  | AFMotor Shield |
| **Rear Left Motor** (M2)   | AFMotor Shield |
| **Front Right Motor** (M3) | AFMotor Shield |
| **Rear Right Motor** (M4)  | AFMotor Shield |

## Code Explanation

- The **AFMotor.h** library is used to control four DC motors.
- The **HC-SR04** ultrasonic sensor measures the distance of obstacles.
- If an object is **less than 10 cm** away:
- The car **stops** for 2 seconds.
- Moves **backward** to avoid the obstacle.
- The robot continues moving forward until another obstacle is detected.
- If the car has moved backward once, it will **stop completely** after reaching its initial position.

## Installation and Usage

1. **Assemble the Hardware**:

- Attach the **Adafruit Motor Shield** to the Arduino.
- Connect the **DC motors** to the motor shield.
- Connect the **HC-SR04 ultrasonic sensor** to pins 9 (Echo) and 10 (Trig).
- Power the system with a **9V or 12V battery pack**.

2. **Upload the Code**:

- Open the **Arduino IDE**.
- Install the **AFMotor Library** (if not already installed).
- Upload the provided **ObstacleAvoidanceCar.ino** code.

3. **Testing the Robot**:

- Place the car on a flat surface.
- Monitor the **serial output** for distance measurements.
- The car should start moving forward, detect obstacles, and respond accordingly.

Future Enhancements
-------------------

* **Automatic Direction Change**: Instead of stopping after one cycle, add a logic to turn left or right based on sensor
  data.
* **Multiple Ultrasonic Sensors**: Add side sensors to improve obstacle detection accuracy.
* **Wireless Control**: Implement Bluetooth or Wi-Fi for remote control.
* **Speed Adjustment**: Adjust motor speed based on obstacle distance.

Troubleshooting
---------------

* If the **car is not moving**, ensure the **motor shield is properly connected**.
* If the **ultrasonic sensor is not detecting obstacles**, check the **wiring and sensor orientation**.
* If the **motors move in the wrong direction**, swap the **motor connections**.

Acknowledgments
---------------

* **Adafruit**: For the **AFMotor library** used to control the motors.
* **Arduino Community**: For extensive resources on motor and sensor interfacing.
* **HC-SR04 Ultrasonic Sensor**: For reliable distance measurements.