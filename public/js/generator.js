document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const nameInput = document.getElementById('nameInput');
    const roleInput = document.getElementById('roleInput');
    const idInput = document.getElementById('idInput');
    const photoInput = document.getElementById('photoInput');
    const downloadBtn = document.getElementById('downloadBtn');

    const cardName = document.getElementById('cardName');
    const cardRole = document.getElementById('cardRole');
    const cardId = document.getElementById('cardId');
    const cardPhoto = document.getElementById('cardPhoto');

    // Default API Key (Should appear in UI or be hidden, hardcoded for demo convenience as per user context)
    const DEFAULT_API_KEY = 'windaacantik';

    let currentPhotoBase64 = '';

    // ==========================================
    // 1. LIVE PREVIEW LOGIC (Client-Side)
    // ==========================================

    // Name Input
    nameInput.addEventListener('input', (e) => {
        const text = e.target.value.toUpperCase();
        const words = text.split(' ');
        if (words.length > 1) {
            // Split first word and rest for styling if needed, or just break line
            // The original script did: words[0] + '<br>' + words.slice(1).join(' ')
            cardName.innerHTML = words[0] + '<br>' + words.slice(1).join(' ');
        } else {
            cardName.textContent = text;
        }
    });

    // Role Input
    roleInput.addEventListener('input', (e) => {
        cardRole.textContent = e.target.value.toUpperCase();
    });

    // ID Input
    idInput.addEventListener('input', (e) => {
        let val = e.target.value;
        // Ensure "ID:" prefix logic matches user expectation
        if (!val.toUpperCase().startsWith('ID:')) {
            cardId.textContent = 'ID: ' + val.toUpperCase();
        } else {
            cardId.textContent = val.toUpperCase();
        }
    });

    // Photo Input
    photoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (readerEvent) {
                // Update Preview
                cardPhoto.src = readerEvent.target.result;
                // Store for API
                currentPhotoBase64 = readerEvent.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    // Barcode DOM Generator (Visual only)
    function createBarcodeDOM() {
        const barcodeContainer = document.querySelector('.barcode');
        if (!barcodeContainer) return;
        barcodeContainer.innerHTML = '';

        for (let i = 0; i < 60; i++) {
            const bar = document.createElement('div');
            bar.classList.add('barcode-bar');
            // Styles are likely in style.css, but we add inline just in case specific logic was needed
            // The original script added these manually
            const width = Math.floor(Math.random() * 3) + 1;
            bar.style.width = width + 'px';
            const gap = Math.floor(Math.random() * 3) + 1;
            bar.style.marginRight = gap + 'px';
            barcodeContainer.appendChild(bar);
        }
    }
    createBarcodeDOM();


    // ==========================================
    // 2. API GENERATION LOGIC (Server-Side)
    // ==========================================
    downloadBtn.addEventListener('click', async () => {
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Generating HQ Card...';
        downloadBtn.disabled = true;

        try {
            // Prepare Payload
            const payload = {
                name: nameInput.value.toUpperCase(),
                role: roleInput.value.toUpperCase(),
                idNumber: idInput.value, // API will handle "ID:" prefix if logic exists, or we send raw
                // We send what the user typed. The API controller implementation (server.js) 
                // typically puts it on the card.
                // Let's check if we need to pre-format. 
                // The DOM preview logic adds "ID: ", but usually APIs expect raw data.
                // However, looking at previous artifacts, the API implementation uses parameters to fill text fields.

                photo: currentPhotoBase64 || undefined,
                validFrom: '2022', // Default or add inputs if needed. User UI has no date inputs in screenshot!
                validTo: '2027'    // User UI screenshot shows "Valid: 2022-2027" hardcoded in HTML preview?
            };

            // Call API
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': DEFAULT_API_KEY
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed');
            }

            // Success! We have a download URL
            const downloadUrl = data.data.downloadUrl;

            // Trigger Download
            // We fetch it as blob to force download behavior in browser
            const imageResp = await fetch(downloadUrl, {
                headers: { 'X-API-Key': DEFAULT_API_KEY }
            });
            const imageBlob = await imageResp.blob();
            const imageObjectUrl = URL.createObjectURL(imageBlob);

            const link = document.createElement('a');
            link.href = imageObjectUrl;
            link.download = `Appleby_ID_${payload.idNumber || 'Card'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Optional: Update preview with the "Real" server image?
            // cardToCapture.style.backgroundImage = `url(${imageObjectUrl})`; 
            // Maybe not, keep the crisp HTML preview.

        } catch (error) {
            console.error('Error:', error);
            alert('Error generating card: ' + error.message);
        } finally {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    });
});
