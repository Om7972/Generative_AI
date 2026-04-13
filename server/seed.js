const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const User = require("./models/User");
const HealthProfile = require("./models/HealthProfile");
const Medication = require("./models/Medication");

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Find the test user or create one
    let user = await User.findOne({ username: "testuser" });
    if (!user) {
      user = await User.create({ username: "testuser", password: "password123", email: "test@example.com" });
      console.log("Created test user: testuser / password123");
    } else {
      console.log("Found test user.");
    }

    // Set up health profile
    await HealthProfile.findOneAndUpdate(
      { user: user._id },
      {
        age: 65,
        weight: 80,
        gender: "male",
        conditions: ["Hypertension", "Type 2 Diabetes"],
        allergies: ["Penicillin"],
        bloodType: "O+",
      },
      { upsert: true, new: true }
    );
    console.log("Health profile populated.");

    // Clear existing meds for test user
    await Medication.deleteMany({ user: user._id });

    // Add some active medications with interactions (to trigger AI features nicely)
    const meds = [
      {
        user: user._id,
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "daily",
        timeOfIntake: "08:00",
        active: true,
      },
      {
        user: user._id,
        name: "Metformin",
        dosage: "500mg",
        frequency: "daily",
        timeOfIntake: "20:00",
        active: true,
      },
      {
        user: user._id,
        name: "Ibuprofen", // Can interact with Lisinopril
        dosage: "400mg",
        frequency: "daily",
        timeOfIntake: "12:00",
        active: true,
      }
    ];

    await Medication.insertMany(meds);
    console.log("Added medications to profile.");
    
    console.log("Data seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedData();
