const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const User = require("./models/User");
const HealthProfile = require("./models/HealthProfile");
const Medication = require("./models/Medication");

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Seed standard test user
    let user = await User.findOne({ username: "testuser" });
    if (!user) {
      user = await User.create({ username: "testuser", password: "password123", email: "test@example.com" });
      console.log("Created test user: testuser / password123");
    } else {
      console.log("Found test user.");
    }

    // Set up health profile for test user
    const weightTest = 80;
    const heightTest = 180;
    const bmiTest = parseFloat((weightTest / ((heightTest / 100) * (heightTest / 100))).toFixed(2));
    
    await HealthProfile.findOneAndUpdate(
      { user: user._id },
      {
        age: 65,
        weight: weightTest,
        height: heightTest,
        bmi: bmiTest,
        gender: "male",
        conditions: ["Hypertension", "Type 2 Diabetes"],
        allergies: ["Penicillin"],
        bloodType: "O+",
      },
      { upsert: true, new: true }
    );
    console.log("Health profile for testuser populated.");

    // Clear existing meds for test user
    await Medication.deleteMany({ user: user._id });

    // Add some active medications with interactions for test user
    const testMeds = [
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
        name: "Ibuprofen",
        dosage: "400mg",
        frequency: "daily",
        timeOfIntake: "12:00",
        active: true,
      }
    ];
    await Medication.insertMany(testMeds);
    console.log("Added medications to testuser profile.");

    // 2. Seed admin user
    let adminUser = await User.findOne({ email: "odhumkeakr@gmail.com" });
    if (!adminUser) {
      // Create admin user with username 'adminuser' and email 'odhumkeakr@gmail.com'
      adminUser = await User.create({
        username: "adminuser",
        password: "password123",
        email: "odhumkeakr@gmail.com",
        displayName: "System Administrator",
        isAdmin: true
      });
      console.log("Created admin user: adminuser (odhumkeakr@gmail.com) / password123");
    } else {
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log("Found admin user (odhumkeakr@gmail.com). Made sure isAdmin is true.");
    }

    // Set up health profile for admin user
    const weightAdmin = 75;
    const heightAdmin = 175;
    const bmiAdmin = parseFloat((weightAdmin / ((heightAdmin / 100) * (heightAdmin / 100))).toFixed(2));

    await HealthProfile.findOneAndUpdate(
      { user: adminUser._id },
      {
        age: 35,
        weight: weightAdmin,
        height: heightAdmin,
        bmi: bmiAdmin,
        gender: "male",
        conditions: ["Mild Asthma"],
        allergies: [],
        bloodType: "A+",
      },
      { upsert: true, new: true }
    );
    console.log("Health profile for admin populated.");

    // Clear existing meds for admin user
    await Medication.deleteMany({ user: adminUser._id });

    // Add medications for admin user
    const adminMeds = [
      {
        user: adminUser._id,
        name: "Albuterol",
        dosage: "90mcg",
        frequency: "as_needed",
        timeOfIntake: "10:00",
        active: true,
      },
      {
        user: adminUser._id,
        name: "Multivitamin",
        dosage: "1 tablet",
        frequency: "daily",
        timeOfIntake: "08:00",
        active: true,
      }
    ];
    await Medication.insertMany(adminMeds);
    console.log("Added medications to admin profile.");

    console.log("Data seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedData();
