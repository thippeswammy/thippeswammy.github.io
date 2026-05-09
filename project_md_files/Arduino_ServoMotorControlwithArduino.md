# Servo Motor Control with Arduino

This Arduino project demonstrates how to control a servo motor using the `Servo` library.

## Components Required:
- Arduino Board (Uno, Mega, etc.)
- Servo Motor (SG90 or similar)
- Jumper Wires

## Circuit Connection:
- Connect the **signal pin** of the servo to **pin 9** on the Arduino.
- Connect the **power (VCC)** of the servo to **5V** on the Arduino.
- Connect the **ground (GND)** of the servo to **GND** on the Arduino.

## How It Works:
1. The servo rotates to **0 degrees**.
2. After a short delay, it rotates to **180 degrees**.
3. This process repeats in a loop.

## How to Upload:
1. Open **Arduino IDE**.
2. Copy and paste the `servo_control.ino` code.
3. Connect your Arduino board to the computer via USB.
4. Select the correct **board** and **port**.
5. Click **Upload**.

## Notes:
- The delay is set to **2ms**, which is very short. You may want to increase it (e.g., `1000` for 1 second) to observe the motion clearly.
- Ensure the servo motor is not overloaded to prevent damage.
