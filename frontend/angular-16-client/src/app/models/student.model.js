import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    studentID: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // store as plain text for now (later we can hash)
    department: { type: String, required: true },
    email: { type: String, required: true }
});

export default mongoose.model("Student", StudentSchema);
