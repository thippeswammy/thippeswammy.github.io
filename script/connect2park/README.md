# Smart Car Parking System

## Overview
The **Smart Car Parking System** is an advanced, real-time parking management application that aims to reduce parking time, improve user convenience, and minimize manual intervention. It enables users to find and book parking slots in real-time using an intuitive Android mobile application integrated with cutting-edge technologies such as Firebase Firestore, Google Maps API, and optional IoT-based slot monitoring.

---

## Features

### For Drivers
- **Real-Time Slot Availability**: View live parking slot availability in nearby locations.
- **Slot Booking**: Reserve parking slots and confirm payment through the app.
- **Navigation**: Integrated Google Maps for navigation to the parking location.
- **Payment Integration**: Make secure payments for booked slots.

### For Parking Managers
- **Slot Management**: Add, update, and delete parking lot details.
- **Real-Time Updates**: IoT sensors and AI cameras update slot status dynamically.
- **Analytics Dashboard**: Monitor bookings, occupancy, and revenue.

---

## Technology Stack

### Frontend
- **Android Studio** (Java/Kotlin)

### Backend
- **Firebase Firestore**: Real-time database management
- **Firebase Authentication**: Secure user management
- **Firebase Cloud Functions**: Serverless backend logic

### APIs
- **Google Maps API**: For geolocation and navigation
- **Payment Gateways**: Razorpay, Stripe, or PayPal for secure transactions

### Hardware (Optional)
- IoT sensors for slot monitoring
- AI-powered cameras for automated detection

---

## System Architecture

### Layers
1. **User Interface**: Android app for searching, booking, and navigating.
2. **Backend**: Firebase services for data storage and real-time synchronization.
3. **IoT/AI (Optional)**: Real-time occupancy updates.
4. **Cloud Integration**: Firebase hosting and cloud functions.

### Database Structure
#### Collections:
1. **Users**:
    - `userId`: Unique identifier
    - `name`: Full name
    - `email`: Email address
    - `role`: Role (Driver or Manager)

2. **ParkingPlaces**:
    - `placeId`: Unique identifier
    - `name`: Parking lot name
    - `latitude/longitude`: GPS coordinates
    - `availableSlots`: Current slot count
    - `totalSlots`: Maximum slot capacity

3. **Bookings**:
    - `bookingId`: Unique identifier
    - `userId`: Associated user
    - `placeId`: Parking location
    - `bookingTime`: Timestamp
    - `slotStatus`: Status (Reserved/Occupied)

---

## How to Run the Project

### Prerequisites
1. **Android Studio** installed on your machine.
2. **Firebase Project** with Firestore and Authentication enabled.
3. **Google Maps API Key**.
4. (Optional) IoT/AI hardware setup for real-time updates.

### Steps
1. Clone this repository:
   ```bash
   git clone <https://github.com/thippeswammy/SmartParking.git>
   cd SmartCarParkingSystem
   ```
2. Import the project into **Android Studio**.
3. Configure the following:
   - Add your **Google Maps API Key** in `AndroidManifest.xml`.
   - Set up Firebase in the project using the `google-services.json` file.
4. Build and run the project on an Android device/emulator.

---

## Usage

### For Drivers:
1. **Login/Signup**: Create an account or log in.
2. **Search for Parking**: Use the map to find nearby parking locations.
3. **Book a Slot**: Reserve a slot and make a payment.
4. **Navigate**: Use the in-app navigation to reach the parking lot.

### For Parking Managers:
1. **Login as Manager**: Access the management panel.
2. **Add Parking Lots**: Add or update parking location details.
3. **Monitor Slots**: Manage availability and track bookings.

---

## Key Challenges and Solutions

### Challenges:
1. Real-time slot updates.
2. Scalability across multiple locations.
3. Accurate location-based parking search.

### Solutions:
1. **IoT/AI Integration**: Real-time monitoring via sensors and AI cameras.
2. **Scalable Infrastructure**: Firebase supports dynamic scaling.
3. **Google Maps API**: Ensures accurate geolocation and navigation.

---

## Future Enhancements
1. **Dynamic Pricing**: Vary slot rates based on demand.
2. **EV Charging Integration**: Add electric vehicle charging stations.
3. **Web Portal**: Enable parking managers to manage lots via a web interface.
4. **Advanced Analytics**: Provide detailed insights into parking lot usage.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Contact
For any inquiries or issues, please contact:
- **Email**: thippeswamy636408@gmail.com
- **Phone**: +91-9901031516
- **Phone**: +91-8073638086
- **GitHub**: [Your GitHub Profile](https://github.com/thippeswammy)
