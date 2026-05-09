# ArduinoLcdWithoutI2c

## Description
This project demonstrates the use of an Arduino board to interface with a 16x2 LCD display without using the I2C interface. The system displays real-time data, including the motor status, water level, temperature, and humidity on the LCD. Additionally, it controls a motor relay based on the motor's status.

## Components Required
- Arduino-compatible board (e.g., Arduino Uno)
- 16x2 LCD display (without I2C)
- Relay module (for controlling motor)
- Potentiometer (for controlling LCD contrast)
- Temperature and humidity sensor (optional, e.g., DHT11 or DHT22)
- Jumper wires

## Pin Configuration
| Component             | Pin    |
|-----------------------|--------|
| LCD RS                | 12     |
| LCD Enable            | 11     |
| LCD D4                | 5      |
| LCD D5                | 4      |
| LCD D6                | 3      |
| LCD D7                | 2      |
| Potentiometer (Contrast) | 6      |
| Relay Module IN       | 6      |

## Code Explanation
- The code initializes the **LiquidCrystal** library to control a 16x2 LCD without the use of I2C communication.
- It displays the following real-time data on the LCD:
 - **Motor status** (On/Off)
 - **Water level** (integer value)
 - **Temperature** (Celsius)
 - **Humidity** (percentage)
- The motor's status is controlled by a boolean variable (`motorRelay`), which can be toggled for testing purposes.

## Installation and Usage
1. **Connect the Hardware**:
 - Connect the LCD to the Arduino according to the pin configuration above.
 - Connect the relay module to pin 6 to control the motor.
 - Optionally, connect a temperature and humidity sensor (e.g., DHT11 or DHT22) for real-time data.
   
2. **Upload the Code**:
 - Open the Arduino IDE.
 - Copy and paste the provided code into the IDE.
 - Select the correct Arduino board (e.g., Arduino Uno) and port.
 - Upload the code to the Arduino.

3. **Monitoring the Output**:
 - After uploading, the LCD will display a welcome message for 2 seconds.
 - The LCD will then update every second to show the motor's status, water level, temperature, and humidity.

Future Enhancements
-------------------

*   **Real-Time Sensor Data**: Integrate actual temperature, humidity, and water level sensors for dynamic readings.
*   **Motor Control Based on Sensor Values**: Control the motor relay based on conditions like temperature or water level.
*   **User Interface**: Add buttons or a touchscreen interface to allow users to modify the water level or other settings directly from the display.
*   **Multiple Sensor Integration**: Add more sensors to monitor additional environmental parameters such as light or pressure.

License
-------

This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
---------------

*   **Arduino Community**: For providing extensive resources and support.
*   **LiquidCrystal Library**: For managing the LCD display with ease.
