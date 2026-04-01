const express = require("express");
const Medication = require("../models/Medication");
const { protect } = require("../middleware/auth");
const apicache = require('apicache');

const router = express.Router();
const cache = apicache.options({ appendKey: (req, res) => req.user.toString() }).middleware;

/**
 * @swagger
 * /api/medications:
 *   get:
 *     summary: Retrieve patient's medication list
 *     tags: [Medications]
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/", protect, cache('1 minute'), async (req, res, next) => {
  try {
    const meds = await Medication.find({ user: req.user }).sort({ createdAt: -1 }).lean();
    res.json(meds);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/medications:
 *   post:
 *     summary: Add a new medication
 *     tags: [Medications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               timeOfIntake:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medication added successfully
 *       400:
 *         description: Missing fields
 *       409:
 *         description: Medication already exists
 */
router.post("/", protect, async (req, res, next) => {
  try {
    const { name, dosage, frequency, timeOfIntake } = req.body;
    
    if (!name || !dosage || !frequency || !timeOfIntake) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    // Checking for duplicates (case insensitive)
    const existingMed = await Medication.findOne({ 
      user: req.user, 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingMed) {
      return res.status(409).json({ message: "You already have this medication registered." });
    }

    const med = await Medication.create({ user: req.user, name, dosage, frequency, timeOfIntake });
    // invalidate cache logic...
    res.status(201).json(med);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/medications/{id}:
 *   put:
 *     summary: Update an existing medication
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully updated
 */
router.put("/:id", protect, async (req, res, next) => {
  try {
    let med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medication not found" });

    if (med.user.toString() !== req.user) return res.status(401).json({ message: "Not authorized" });

    med = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(med);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/medications/{id}:
 *   delete:
 *     summary: Remove a medication
 *     tags: [Medications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully removed medication
 */
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ message: "Medication not found" });

    if (med.user.toString() !== req.user) return res.status(401).json({ message: "Not authorized" });

    await med.deleteOne();
    res.json({ message: "Medication removed correctly" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
