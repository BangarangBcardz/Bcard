document.getElementById('save-contact').addEventListener('click', function () {
  // Define contact details
  const contact = {
    name: 'Christo Meiring', // Full name or business name
    business: 'Bangarang Crafts', // Business name
    mobile: '+27 765202303', // Mobile number
    email: 'christo.bangarang@gmail.com', // Email address
    website: 'https://bangarangcrafts.co.za', // Website URL
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
  `;

  try {
    // Create a Blob with the vCard content
    const blob = new Blob([vCardContent], { type: 'text/vcard' });

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${contact.name.replace(/ /g, '_')}.vcf`; // File name (replace spaces with underscores)
    link.style.display = 'none';

    // Append the link to the body and trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    // Notify the user
    alert('Contact info saved successfully! Open the downloaded file to add to your address book.');
  } catch (error) {
    console.error('Error generating vCard:', error);
    alert('Failed to save contact info. Please try again.');
  }
});