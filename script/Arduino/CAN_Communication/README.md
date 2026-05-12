# CAN Communication with MCP2515

## Description
This project demonstrates CAN bus communication using the MCP2515 module with an Arduino-compatible microcontroller. It initializes the MCP2515, sends CAN messages, and listens for incoming messages to trigger an LED for monitoring purposes.

## Components Required
- Arduino-compatible board
- MCP2515 CAN module
- SPI Interface (MISO, MOSI, SCK, CS)
- LED (for monitoring received CAN messages)
- Jumper wires

## Pin Configuration
| Component | Pin |
|-----------|-----|
| MCP2515 CS | 10 |
| LED | 53 |

## Code Explanation
- Initializes the MCP2515 with a baud rate of 500kbps.
- Sends a CAN message with ID `0x12910109` and data `00660000000000`.
- Monitors incoming CAN messages and triggers an LED if the specific ID `0x12910109` is received.

## Installation and Usage
1. Connect the MCP2515 module to the Arduino as per the pin configuration.
2. Upload the provided code to the microcontroller using the Arduino IDE.
3. Monitor CAN messages through the Serial Monitor and observe LED triggering.

## Future Enhancements
- Implement CAN filtering for more specific message handling.
- Use interrupts instead of polling for message reception.
- Expand to multiple nodes for a more complex CAN network.

