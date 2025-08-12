const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/lp', require('./routes/lpRoutes'));
app.use('/api/company', require('./routes/companyRoutes'));
app.use('/api/opportunities', require('./routes/opportunitiesRoutes'));
app.use('/api/applications', require('./routes/applicationsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
