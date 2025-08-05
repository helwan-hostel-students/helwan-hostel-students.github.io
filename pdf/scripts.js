document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadPDF');
    const errorDiv = document.getElementById('error');
    const uploaderInputs = document.querySelectorAll('.uploader');

    /**
     * Reads an image file, converts it to grayscale, and returns it as a Data URL.
     * @param {File} file The image file to process.
     * @returns {Promise<string>} A promise that resolves with the grayscale image Data URL.
     */
    const processImageToGrayscale = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    for (let i = 0; i < data.length; i += 4) {
                        // Using the luminosity method for better grayscale representation
                        const grayscale = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                        data[i] = grayscale; // red
                        data[i + 1] = grayscale; // green
                        data[i + 2] = grayscale; // blue
                    }

                    ctx.putImageData(imageData, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg'));
                };
                img.onerror = (err) => reject(new Error('Image could not be loaded.'));
                img.src = e.target.result;
            };
            reader.onerror = (err) => reject(new Error('File could not be read.'));
            reader.readAsDataURL(file);
        });
    };

    downloadBtn.addEventListener('click', async () => {
        errorDiv.textContent = '';
        errorDiv.classList.remove('visible');

        // *** MODIFIED VALIDATION LOGIC STARTS HERE ***
        // Loop through each uploader to find the first one that's empty.
        for (const input of uploaderInputs) {
            if (input.files.length === 0) {
                // Use the data-card-name attribute for a specific error message.
                errorDiv.textContent = `نسيت صورة ${input.dataset.cardName} روح ارفعها.`;
                errorDiv.classList.add('visible');
                return; // Stop the process if a file is missing.
            }
        }
        // *** MODIFIED VALIDATION LOGIC ENDS HERE ***

        const files = Array.from(uploaderInputs).map(input => input.files[0]);

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'جاري التجهيز...';

        try {
            const grayscaledImagePromises = files.map(processImageToGrayscale);
            const grayscaledImages = await Promise.all(grayscaledImagePromises);

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');

            // Constants for layout
            const CARD_WIDTH = 85.6;
            const CARD_HEIGHT = 53.98;
            const A4_WIDTH = 210;
            const V_GAP = 10; // Vertical gap between card rows
            const H_GAP = 5;  // Horizontal gap between front and back images

            const totalContentWidth = CARD_WIDTH * 2 + H_GAP;
            const x_start = (A4_WIDTH - totalContentWidth) / 2;
            const y_start = 15; // Top margin

            // Define positions for each card image [x, y]
            // The layout follows the provided screenshot: Back on the left, Front on the right.
            const positions = [
                // Student Card (Row 1)
                { x: x_start, y: y_start }, // Back
                { x: x_start + CARD_WIDTH + H_GAP, y: y_start }, // Front

                // Guardian Card (Row 2)
                { x: x_start, y: y_start + CARD_HEIGHT + V_GAP }, // Back
                { x: x_start + CARD_WIDTH + H_GAP, y: y_start + CARD_HEIGHT + V_GAP }, // Front

                // Guarantor Card (Row 3)
                { x: x_start, y: y_start + 2 * (CARD_HEIGHT + V_GAP) }, // Back
                { x: x_start + CARD_WIDTH + H_GAP, y: y_start + 2 * (CARD_HEIGHT + V_GAP) }, // Front
            ];

            // Add images to the PDF in the correct order
            // grayscaledImages order: [StudentFront, StudentBack, GuardianFront, GuardianBack, GuarantorFront, GuarantorBack]
            
            // Student
            doc.addImage(grayscaledImages[0], 'JPEG', positions[1].x, positions[1].y, CARD_WIDTH, CARD_HEIGHT); // Front
            doc.addImage(grayscaledImages[1], 'JPEG', positions[0].x, positions[0].y, CARD_WIDTH, CARD_HEIGHT); // Back

            // Guardian
            doc.addImage(grayscaledImages[2], 'JPEG', positions[3].x, positions[3].y, CARD_WIDTH, CARD_HEIGHT); // Front
            doc.addImage(grayscaledImages[3], 'JPEG', positions[2].x, positions[2].y, CARD_WIDTH, CARD_HEIGHT); // Back

            // Guarantor
            doc.addImage(grayscaledImages[4], 'JPEG', positions[5].x, positions[5].y, CARD_WIDTH, CARD_HEIGHT); // Front
            doc.addImage(grayscaledImages[5], 'JPEG', positions[4].x, positions[4].y, CARD_WIDTH, CARD_HEIGHT); // Back

            // Generate filename as ID-Date-TimeInSeconds
            const now = new Date();
            const date = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
            const timeInSeconds = Math.floor(now.getTime() / 1000);
            const filename = `ID-${date}-${timeInSeconds}.pdf`;

            doc.save(filename);

        } catch (error) {
            console.error('Error generating PDF:', error);
            errorDiv.textContent = 'حصل مشكلة، اتأكد انك مختار ملفات الصور صح يعني مش مختار ملف تاني بالغلط';
            errorDiv.classList.add('visible');
        } finally {
            downloadBtn.disabled = false;
            // The button text in your HTML file is different, so I'll match that.
            downloadBtn.textContent = 'حمل الملف';
        }
    });
});
