document.getElementById('save-contact').addEventListener('click', function () {
  // Define contact details
  const contact = {
    name: 'Christo Meiring',
    business: 'Bangarang Crafts',
    mobile: '+27 765202303',
    email: 'christo.bangarang@gmail.com',
    website: 'https://bangarangcrafts.co.za',
  };

  // Create vCard content
  const vCardContent = `
BEGIN:VCARD
VERSION:3.0
FN:${contact.name}
ORG:${contact.business}
TEL;TYPE=CELL:${contact.mobile}
EMAIL:${contact.email}
URL:${contact.website}
END:VCARD
  `.trim(); // Trim removes extra whitespace

  try {
    // First try using data URI approach (better for mobile)
    const dataUri = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vCardContent);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `${contact.name.replace(/ /g, '_')}.vcf`;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    // Wait a moment before removing to ensure click completes
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);

    // Check if download likely succeeded (mobile browsers often don't report failures)
    setTimeout(() => {
      // This alert will show unless the user cancels it
      alert('Contact info saved successfully!\n\n' + 
            'Look for the .vcf file in your downloads.\n' +
            'Open it to add to your contacts.');
    }, 300);

  } catch (error) {
    console.error('Error generating vCard:', error);
    
    // Fallback 1: Try simple blob method (works on some devices where data URI fails)
    try {
      const blob = new Blob([vCardContent], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${contact.name.replace(/ /g, '_')}.vcf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      alert('Contact info saved! Check your downloads for the .vcf file.');
    } catch (blobError) {
      console.error('Blob method also failed:', blobError);
      
      // Final fallback: Show contact info directly
      const contactText = 
        `Name: ${contact.name}\n` +
        `Business: ${contact.business}\n` +
        `Phone: ${contact.mobile}\n` +
        `Email: ${contact.email}\n` +
        `Website: ${contact.website}\n\n` +
        `You can manually create a contact with these details.`;
      
      if (confirm('Automatic download failed. Copy contact details to clipboard?\n\n' + contactText)) {
        navigator.clipboard.writeText(contactText)
          .then(() => alert('Contact details copied to clipboard!'))
          .catch(() => alert('Could not copy automatically. Please manually note the details.'));
      }
    }
  }
});

// Optional: Add Web Share API support if available
if (navigator.share) {
  const shareButton = document.createElement('button');
  shareButton.textContent = 'Share Contact';
  shareButton.className = 'link-button';
  shareButton.id = 'share-contact';
  shareButton.addEventListener('click', async () => {
    try {
      await navigator.share({
        title: 'Bangarang Crafts Contact',
        text: 'Contact details for Christo Meiring',
        url: 'https://bangarangcrafts.co.za',
      });
    } catch (err) {
      console.log('Sharing cancelled:', err);
    }
  });
  
  // Add share button to the links section
  document.querySelector('.links-section').appendChild(shareButton);
}
