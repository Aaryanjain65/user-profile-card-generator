const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// JSON database file
const dbFile = path.join(__dirname, "profiles.json");

// Create database file if it doesn't exist
if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, "[]");
}

// Read profiles
function getProfiles() {
    try {
        return JSON.parse(fs.readFileSync(dbFile, "utf8"));
    } catch (error) {
        return [];
    }
}

// Save profiles
function saveProfiles(profiles) {
    fs.writeFileSync(dbFile, JSON.stringify(profiles, null, 2));
}

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Profile form submission
app.post("/profile", (req, res) => {

    const { name, bio, skills, social } = req.body;

    // Create profile object
    const newProfile = {
        id: Date.now(),
        name: name || "Unknown User",
        bio: bio || "No bio provided",
        skills: skills || "No skills provided",
        social: social || "#",
        createdAt: new Date().toLocaleString()
    };

    // Get old profiles
    const profiles = getProfiles();

    // Add new profile
    profiles.push(newProfile);

    // Save to JSON database
    saveProfiles(profiles);

    // Generate profile card
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Profile Card</title>

    <style>

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: Arial, sans-serif;

            background:
                radial-gradient(circle at top left, #5b21b6, transparent 35%),
                radial-gradient(circle at bottom right, #2563eb, transparent 35%),
                #080b18;

            color: white;

            display: flex;
            justify-content: center;
            align-items: center;

            padding: 30px;
        }

        .container {
            width: 100%;
            max-width: 600px;
        }

        .title {
            text-align: center;
            margin-bottom: 25px;
        }

        .title h1 {
            font-size: 36px;
            margin: 0;
            background: linear-gradient(90deg, #a855f7, #38bdf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .title p {
            color: #b8c1d9;
            margin-top: 8px;
        }

        .card {
            background: rgba(20, 25, 45, 0.92);
            border: 1px solid rgba(139, 92, 246, 0.5);
            border-radius: 25px;
            padding: 35px;

            box-shadow:
                0 20px 60px rgba(0,0,0,0.5),
                0 0 30px rgba(99,102,241,0.2);
        }

        .avatar {
            width: 100px;
            height: 100px;

            border-radius: 50%;

            margin: 0 auto 20px;

            display: flex;
            align-items: center;
            justify-content: center;

            font-size: 40px;
            font-weight: bold;

            background: linear-gradient(135deg, #9333ea, #2563eb);

            box-shadow: 0 0 30px rgba(139,92,246,0.5);
        }

        .name {
            text-align: center;
            font-size: 30px;
            margin-bottom: 10px;
        }

        .bio {
            text-align: center;
            color: #b8c1d9;
            line-height: 1.6;
            margin-bottom: 25px;
        }

        .section {
            margin-top: 20px;
        }

        .section h3 {
            color: #c084fc;
            margin-bottom: 8px;
        }

        .skills {
            background: #111827;
            padding: 15px;
            border-radius: 12px;
            color: #dbeafe;
        }

        .social {
            display: inline-block;
            margin-top: 10px;

            padding: 12px 20px;

            border-radius: 10px;

            text-decoration: none;

            color: white;

            background: linear-gradient(90deg, #7c3aed, #2563eb);

            transition: 0.3s;
        }

        .social:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(99,102,241,0.5);
        }

        .back {
            display: block;
            text-align: center;
            margin-top: 25px;
            color: #93c5fd;
            text-decoration: none;
        }

    </style>
</head>

<body>

<div class="container">

    <div class="title">
        <h1>✨ Profile Created</h1>
        <p>Your professional profile card</p>
    </div>

    <div class="card">

        <div class="avatar">
            ${escapeHTML(newProfile.name.charAt(0).toUpperCase())}
        </div>

        <h2 class="name">
            ${escapeHTML(newProfile.name)}
        </h2>

        <p class="bio">
            ${escapeHTML(newProfile.bio)}
        </p>

        <div class="section">
            <h3>💻 Skills</h3>

            <div class="skills">
                ${escapeHTML(newProfile.skills)}
            </div>
        </div>

        <div class="section">
            <h3>🔗 Social Profile</h3>

            <a
                class="social"
                href="${escapeAttribute(newProfile.social)}"
                target="_blank"
            >
                Visit Profile →
            </a>
        </div>

    </div>

    <a class="back" href="/">
        ← Create Another Profile
    </a>

</div>

</body>
</html>
    `);
});

// Security: escape HTML
function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(text) {
    return escapeHTML(text);
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});