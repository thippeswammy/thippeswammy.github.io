# SmartWaterManager

SmartWaterManager is an IoT-based water management system that monitors water levels, temperature, and humidity. It integrates sensors and motor control for automated water level management in various applications, including agriculture and home water systems. The system provides real-time data through a web dashboard and displays vital information on an LCD screen.

## Project Features:
- **Water Level Monitoring**: Uses an analog water sensor to track water levels and trigger the motor when needed.
- **Temperature & Humidity Sensing**: Uses a DHT11 sensor to monitor the temperature and humidity levels.
- **Automated Motor Control**: Based on water level and system mode, the motor is activated/deactivated automatically or manually.
- **IoT Cloud Integration**: Data is synchronized with the Arduino IoT Cloud for remote monitoring and control.
- **LCD Display**: Displays water level, motor status, temperature, and humidity on a 16x2 LCD screen.

## Components Required:
- Arduino Board (e.g., Arduino Uno, Nano, or MKR series)
- DHT11 Temperature and Humidity Sensor
- Analog Water Level Sensor
- 16x2 LCD Display with I2C module
- Relay Module (for motor control)
- Motor
- Jumper Wires
- Power Source (for Arduino and motor)

## Circuit Connections:
1. **Water Level Sensor**: Connect to analog pin A0.
2. **DHT11 Sensor**: Connect the data pin to digital pin D2.
3. **Motor Relay**: Connect to digital pin D1 for controlling the motor.
4. **LCD Display**: Connect to SDA (D6) and SCL (D7) pins.
5. **Motor Power**: Connect to an external power source (make sure to handle motor voltage appropriately).

## How It Works:
1. The system reads temperature and humidity values using the DHT11 sensor.
2. Water level is monitored by the analog water sensor, and motor control is managed based on the water level.
3. The system can run in **Automatic** mode (motor turns on when water level is low) or **Manual** mode (control motor using the cloud dashboard).
4. The status is displayed on the LCD, and real-time data is sent to the Arduino IoT Cloud for remote access.

## How to Use:
1. Upload the code (`SmartWaterManager.ino`) to your Arduino board.
2. Open the **Arduino IDE** and select the appropriate board and port.
3. Use the Arduino IoT Cloud dashboard to monitor and control the system remotely.
4. The LCD screen will display real-time updates on water level, temperature, and humidity, as well as the motor's status.

## Cloud Integration:
- **Water Level**: Read/Write variable used for water level data.
- **Temperature**: Read/Write variable for temperature updates.
- **Humidity**: Read/Write variable for humidity data.
- **Motor Relay**: Read/Write variable for motor control (on/off).
- **Is Automatic**: Read/Write variable for toggling between automatic and manual modes.

## Installation and Setup:
1. Open the **Arduino IDE** and select **Arduino IoT Cloud**.
2. Create a new Thing in the Arduino IoT Cloud.
3. Link your **Arduino Board** to the cloud platform.
4. Use the provided code to sync your device to the cloud.
5. Monitor and control your SmartWaterManager through the cloud dashboard.

## Acknowledgments:
- Arduino Team for IoT Cloud integration.
- DHT11 and analog water sensor manufacturers for their hardware components.

