const fs = require('fs');
const pdf = require('pdf-parse');

const filePath = 'BROCHURE.pdf';
if(fs.existsSync(filePath)) {
    const dataBuffer = fs.readFileSync(filePath);
    pdf(dataBuffer).then(function(data) {
        console.log("=== PDF START ===");
        console.log(data.text);
        console.log("=== PDF END ===");
    }).catch(e => {
        console.error("PDF Parsing error:", e);
    });
} else {
    console.error("BROCHURE.pdf not found in the current directory!");
}
