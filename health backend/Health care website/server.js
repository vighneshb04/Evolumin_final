require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs'); // For password hashing
const fileUpload = require('express-fileupload');
const pdf = require('pdf-parse');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

// Serve static files
app.use(express.static(path.join(__dirname, 'Main page(index)')));
app.use('/Dashboard', express.static(path.join(__dirname, 'Dashboard')));
app.use('/healthrecords', express.static(path.join(__dirname, 'healthrecords')));
app.use('/patientinfosharing', express.static(path.join(__dirname, 'patientinfosharing')));
app.use('/abulancebooking',express.static(path.join(__dirname, 'abulancebooking')));
app.use('/alterts', express.static(path.join(__dirname, 'alterts')));
// Connect to MongoDB


const connectToDatabases = async () => {
    try {
        const ambulanceDb = await mongoose.createConnection(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to Ambulance Booking Database');

        const loginsDb = await mongoose.createConnection(process.env.MONGO_URI2, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to Logins Database');

        const studentDb = await mongoose.createConnection(process.env.MONGO_URI3, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to Student Database');

        return { ambulanceDb, loginsDb, studentDb };
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Start server and connect to databases
const startServer = async () => {
    const { ambulanceDb, loginsDb, studentDb } = await connectToDatabases();

    // Create Schemas and Models
    const BookingSchema = new mongoose.Schema({
        mobile: { type: String, required: true },
        location: { type: String, required: true },
    });

    const Booking = ambulanceDb.model('Booking', BookingSchema);

    const LoginSchema = new mongoose.Schema({
        loginid: { type: String, unique: true, required: true },
        password: { type: String, required: true },
    });

    const Login = loginsDb.model('Login', LoginSchema);

    const AbnormalReportSchema = new mongoose.Schema({
        visitId: { type: String, required: true, unique: true },
        test: String,
        method: String,
        specimen: String,
        value: String,
        unit: String,
        date: { type: Date, default: Date.now }
    });

    const AbnormalReport = studentDb.model('AbnormalReport', AbnormalReportSchema, 'abnormalReports');

    const StudentSchema = new mongoose.Schema({
        studentID: String,
        firstName: String,
        lastName: String,
        sex: String,
        dob: Date,
        phoneNumber: String,
        email: String,
        address: {
            street: String,
            city: String,
            state: String,
            postalCode: String
        },
        emergencyContact: {
            firstName: String,
            lastName: String,
            relationship: String,
            phoneNumber: String
        },
        healthHistory: String,
        medications: [String]
    });

    const Student = studentDb.model('studentinfo', StudentSchema);

    // Routes
    app.post('/book', async (req, res) => {
        const { mobile, location } = req.body;
        const newBooking = new Booking({ mobile, location });

        try {
            await newBooking.save();
            res.status(200).send({ message: 'Booking saved successfully!' });
        } catch (err) {
            res.status(500).send({ message: 'Error saving booking', error: err });
        }
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'Main page(index)', 'index.html'));
    });

    app.post('/update-password', async (req, res) => {
        const { loginid, newPassword } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const result = await Login.updateOne({ loginid }, { password: hashedPassword });

            if (result.nModified === 0) {
                return res.status(404).send({ message: 'No user found with that loginid' });
            }

            res.status(200).send({ message: 'Password updated successfully!' });
        } catch (err) {
            res.status(500).send({ message: 'Error updating password', error: err });
        }
    });

    app.post('/login', async (req, res) => {
        const { loginid, password } = req.body;

        try {
            const user = await Login.findOne({ loginid });
            if (!user) {
                return res.status(401).send({ message: 'Invalid loginid or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).send({ message: 'Invalid loginid or password' });
            }

            res.status(200).send({ message: 'Login successful' });
        } catch (error) {
            res.status(500).send({ message: 'Server error', error: error });
        }
    });

    app.post('/process', async (req, res) => {
        const pdfFile = req.files.file;

        if (!pdfFile) {
            return res.status(400).send('No file uploaded.');
        }

        const filePath = `./healthrecords/uploads/${pdfFile.name}`;
        await pdfFile.mv(filePath);

        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);

            const title = pdfFile.name;
            let clinicalSummary = [];
            let visitId = data.text.match(/Visit ID:\s*(\S+)/)?.[1];

            if (!visitId) {
                return res.status(400).send('Invalid PDF format.');
            }

            const regex = /(TOTAL CHOLESTEROL|LDL CHOLESTEROL - DIRECT|HDL CHOLESTEROL \(DIRECT\)|TRIGLYCERIDES|VLDL CHOLESTEROL|NON-HDL CHOLESTEROL|TOTAL CHO\/HDL RATIO|LDL\/HDL RATIO|TGL\/HDL Ratio)\s*Method:\s*([\w\s&\/]+)\s*Specimen:\s*([\w]+)\s*(\d+\.?\d*)\s*(mg\/dL|plu\/mL|U\/L)\s*(Desirable:.*?)?(High:.*?)?$/gm;

            let match;
            while ((match = regex.exec(data.text)) !== null) {
                const test = match[1].trim();
                const method = match[2].trim();
                const specimen = match[3].trim();
                const value = parseFloat(match[4]);
                const unit = match[5];

                const normalRanges = {
                    "TOTAL CHOLESTEROL": { normal: 200, high: 201 },
                    // Add ranges for other tests
                };

                let isAbnormal = false;

                if (normalRanges[test]) {
                    const { normal, high } = normalRanges[test];
                    if (value < normal || value > high) {
                        isAbnormal = true;
                    }
                }

                const existingReport = await AbnormalReport.findOne({ visitId, test });
                if (!existingReport) {
                    if (isAbnormal) {
                        const abnormalResult = new AbnormalReport({ visitId, test, method, specimen, value, unit });
                        await abnormalResult.save();
                    }
                    clinicalSummary.push({ test, method, specimen, value, unit });
                }
            }

            res.json({ title, clinicalSummary });
        } catch (error) {
            console.error('Error processing PDF:', error);
            res.status(500).send('Error processing PDF.');
        } finally {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Failed to delete temporary file:', err);
            });
        }
    });

    app.get('/view-abnormal-reports', async (req, res) => {
        try {
            const reports = await AbnormalReport.find().sort({ date: -1 });
            res.json(reports);
        } catch (err) {
            res.status(500).send({ message: 'Error retrieving reports', error: err });
        }
    });

    app.get('/patientinfosharing', (req, res) => {
        res.sendFile(path.join(__dirname, 'patientinfosharing', 'index.html'));
    });
    app.get('/ambulancebooking', (req, res) => {
        res.sendFile(path.join(__dirname, 'ambulancebooking', 'abubook.html'));
    });
    app.get('/alterts', (req, res) => {
        res.sendFile(path.join(__dirname, 'alterts', 'alert.html'));
    });
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

// Start the server
startServer();
