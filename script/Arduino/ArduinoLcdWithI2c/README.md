# ArduinoLcdWithI2c

## Description
This project demonstrates how to use an Arduino board with a 16x2 LCD (I2C) to display real-time data such as motor status, water level, temperature, and humidity. The project also includes a relay module for controlling the motor and is designed for use in applications such as environmental monitoring, automation, and IoT.

## Components Required
- Arduino-compatible board (e.g., Arduino Uno)
- 16x2 LCD display (I2C interface)
- Relay module (for controlling motor)
- Temperature and humidity sensor (e.g., DHT11 or DHT22)
- Jumper wires
- Potentiometer (optional, for adjusting LCD contrast)

## Pin Configuration
| Component             | Pin    |
|-----------------------|--------|
| LCD SDA               | A4     |
| LCD SCL               | A5     |
| LCD VCC               | 5V     |
| LCD GND               | GND    |
| Relay Module IN       | 6      |
| Potentiometer (Contrast) | 6      |

## Code Explanation
- Initializes the **LiquidCrystal** library to control a 16x2 LCD using I2C communication.
- Displays real-time information on the LCD, including:
  - **Motor status** (On/Off)
  - **Water level** (integer value)
  - **Temperature** (Celsius)
  - **Humidity** (percentage)
- The motor's status is controlled by a boolean variable (`motorRelay`), which can be toggled for testing purposes.

## Installation and Usage
1. **Connect the Hardware**:
   - Connect the LCD to the Arduino as per the pin configuration.
   - Connect the relay module to pin 6 for controlling the motor.
   - Optionally, connect a temperature and humidity sensor (e.g., DHT11 or DHT22) for real-time data.
   
2. **Upload the Code**:
   - Open the Arduino IDE.
   - Copy and paste the provided code into the IDE.
   - Select the correct Arduino board (e.g., Arduino Uno) and port.
   - Upload the code to the Arduino.

3. **Monitoring the Output**:
   - Once the code is uploaded, the LCD will display a welcome message for 2 seconds.
   - After that, it will update every second to show the motor's status, water level, temperature, and humidity.

## Future Enhancements
- **Real-Time Sensor Data**: Integrate actual temperature, humidity, and water level sensors for dynamic readings.
- **Motor Control Based on Sensor Values**: Control the motor relay based on conditions like temperature or water level.
- **User Interface**: Add buttons or a touchscreen interface to allow users to modify the water level or other settings directly from the display.
- **Multiple Sensor Integration**: Add more sensors to monitor additional environmental parameters such as light or pressure.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- **Arduino Community**: For providing extensive resources and support.
- **I2C Communication**: For enabling efficient communication with the LCD.
- **LiquidCrystal Library**: For managing the LCD display with ease.


