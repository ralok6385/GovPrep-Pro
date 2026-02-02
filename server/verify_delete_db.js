const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Subject = require('./models/Subject');

dotenv.config();

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected');

        // 1. Create Dummy
        const dummy = await Subject.create({
            name: 'DeleteMe_' + Date.now(),
            slug: 'delete-me-' + Date.now(),
            examId: new mongoose.Types.ObjectId(), // Random ID
            icon: 'Trash'
        });
        console.log('Created Dummy Subject:', dummy._id);

        // 2. Try Delete
        console.log('Attempting verify delete...');
        const result = await Subject.deleteOne({ _id: dummy._id });
        console.log('Delete Result:', result);

        // 3. Verify
        const check = await Subject.findById(dummy._id);
        if (!check) {
            console.log('✅ SUCCESS: Subject was deleted.');
        } else {
            console.log('❌ FAILURE: Subject still exists!');
        }

    } catch (e) {
        console.error('Test Failed:', e);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

runTest();
