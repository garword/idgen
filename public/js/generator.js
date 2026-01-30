document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('generator-form');
    const photoInput = document.getElementById('photo');
    const fileNameDisplay = document.getElementById('file-name');
    const previewArea = document.getElementById('preview-area');
    const resultImage = document.getElementById('result-image');
    const placeholder = document.getElementById('preview-placeholder');
    const loadingSpinner = document.getElementById('loading-spinner');
    const downloadSection = document.getElementById('download-section');
    const downloadLink = document.getElementById('download-link');
    const errorMessage = document.getElementById('error-message');
    const generateBtn = document.getElementById('generate-btn');

    let photoBase64 = '';

    // Handle file selection
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileNameDisplay.textContent = `Selected: ${file.name}`;

            // Convert to Base64
            const reader = new FileReader();
            reader.onload = function (e) {
                photoBase64 = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            fileNameDisplay.textContent = '';
            photoBase64 = '';
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Reset state
        errorMessage.style.display = 'none';
        downloadSection.style.display = 'none';
        resultImage.style.display = 'none';
        placeholder.style.display = 'none';
        loadingSpinner.style.display = 'block';
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        const apiKey = document.getElementById('api-key').value;
        const name = document.getElementById('name').value;
        const role = document.getElementById('role').value;
        const idNumber = document.getElementById('idNumber').value;
        const validFrom = document.getElementById('validFrom').value;
        const validTo = document.getElementById('validTo').value;

        try {
            const payload = {
                name,
                role,
                idNumber,
                validFrom,
                validTo,
                photo: photoBase64 || undefined
            };

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate card');
            }

            // Success
            const downloadUrl = data.data.downloadUrl;

            // Fetch the image to display it
            const imageResponse = await fetch(downloadUrl, {
                headers: { 'X-API-Key': apiKey }
            });
            const imageBlob = await imageResponse.blob();
            const imageUrl = URL.createObjectURL(imageBlob);

            resultImage.src = imageUrl;
            resultImage.style.display = 'block';

            downloadLink.href = imageUrl;
            downloadSection.style.display = 'block';

        } catch (error) {
            errorMessage.textContent = error.message;
            errorMessage.style.display = 'block';
            placeholder.style.display = 'block';
        } finally {
            loadingSpinner.style.display = 'none';
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generator ID Card';
        }
    });
});
