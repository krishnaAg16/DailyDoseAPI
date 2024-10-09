import express from "express";
import cors from "cors";
import dataRoutes from "./routes/data.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/data', dataRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
