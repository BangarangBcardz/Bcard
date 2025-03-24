document.getElementById('save-contact').addEventListener('click', function() {
  const contact = {
    name: 'Christo Meiring',
    business: 'Bangarang Crafts',
    mobile: '+27 765202303',
    email: 'christo.bangarang@gmail.com',
    website: 'https://bangarangcrafts.co.za'
  };

  // Create vCard content
  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    `ORG:${contact.business}`,
    `TEL;TYPE=CELL:${contact.mobile.replace(/\s/g, '')}`, // Remove spaces for better compatibility
    `EMAIL:${contact.email}`,
    `URL:${contact.website}`,
    'END:VCARD'
  ].join('\n');

  // First try the Web Share API for native contact integration
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
    try {
      const blob = new Blob([vCardContent], { type: 'text/vcard' });
      const file = new File([blob], `${contact.name.replace(/\s/g, '_')}.vcf`, {
        type: 'text/vcard'
      });
      
      navigator.share({
        title: 'Add to Contacts',
        text: `Add ${contact.name} to your contacts`,
        files: [file]
      }).catch(() => fallbackToDownload(vCardContent, contact));
    } catch (e) {
      fallbackToDownload(vCardContent, contact);
    }
  } else {
    // Fallback to download with instructions
    fallbackToDownload(vCardContent, contact);
  }
});

function fallbackToDownload(vCardContent, contact) {
  try {
    // Try data URI method first
    const dataUri = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vCardContent);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = `${contact.name.replace(/\s/g, '_')}.vcf`;
    
    // For iOS, we need to actually add the element to the DOM
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show instructions based on platform
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      alert('Tap "Share" then "Add to Contacts" to save this contact');
    } else if (/Android/i.test(navigator.userAgent)) {
      alert('Open the downloaded .vcf file to add to your contacts');
    } else {
      alert('Contact file downloaded. Open it to add to your address book');
    }
  } catch (e) {
    // Ultimate fallback - show contact details
    const contactDetails = [
      `Name: ${contact.name}`,
      `Business: ${contact.business}`,
      `Phone: ${contact.mobile}`,
      `Email: ${contact.email}`,
      `Website: ${contact.website}`
    ].join('\n\n');
    
    if (navigator.clipboard) {
      if (confirm('Copy contact details to clipboard?')) {
        navigator.clipboard.writeText(contactDetails)
          .then(() => alert('Contact details copied! Paste them into your contacts app'))
          .catch(() => alert(contactDetails));
      } else {
        alert(contactDetails);
      }
    } else {
      alert(contactDetails);
    }
  }
}
