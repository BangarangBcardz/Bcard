// ============================================
// SAVE CONTACT FUNCTIONALITY
// ============================================

document.getElementById('save-contact').addEventListener('click', async function() {
  const contact = {
    name: 'Christo Meiring',
    business: 'Bangarang Crafts',
    mobile: '+27765202303', // Removed spaces for better compatibility
    email: 'christo.bangarang@gmail.com',
    website: 'https://bangarangcrafts.co.za'
  };

  // Create vCard content
  const vCardContent = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    `ORG:${contact.business}`,
    `TEL;TYPE=CELL:${contact.mobile}`,
    `EMAIL:${contact.email}`,
    `URL:${contact.website}`,
    'END:VCARD'
  ].join('\n');

  // 1. First try Web Share API with file (works on many mobile browsers)
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
    try {
      const blob = new Blob([vCardContent], { type: 'text/vcard' });
      const file = new File([blob], `${contact.name.replace(/\s/g, '_')}.vcf`, {
        type: 'text/vcard'
      });
      
      await navigator.share({
        title: 'Add to Contacts',
        text: `Add ${contact.name} to your contacts`,
        files: [file]
      });
      return;
    } catch (e) {
      console.log('Web Share failed, falling back');
    }
  }

  // 2. Try Android intent (may open contacts app directly)
  if (/android/i.test(navigator.userAgent)) {
    try {
      const intentUrl = `intent://add_contact#Intent;scheme=content;type=text/x-vcard;S.file_name=${encodeURIComponent(contact.name)}.vcf;end`;
      window.location.href = intentUrl;
      
      // Fallback after short delay if intent fails
      setTimeout(() => {
        downloadVCardWithInstructions(vCardContent, contact);
      }, 300);
      return;
    } catch (e) {
      console.log('Android intent failed');
    }
  }

  // 3. Final fallback - download with instructions
  downloadVCardWithInstructions(vCardContent, contact);
});

function downloadVCardWithInstructions(vCardContent, contact) {
  try {
    // Create download
    const blob = new Blob([vCardContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contact.name.replace(/\s/g, '_')}.vcf`;
    
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    // Platform-specific instructions
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      alert('1. Tap the share icon (box with arrow)\n2. Scroll and select "Add to Contacts"');
    } else if (/Android/i.test(navigator.userAgent)) {
      alert('1. Open your Downloads folder\n2. Tap the .vcf file\n3. Select "Add to Contacts"');
    } else {
      alert('Contact file downloaded. Open it to add to your address book');
    }
  } catch (e) {
    // Ultimate fallback - show contact details
    showManualContactInstructions(contact);
  }
}

function showManualContactInstructions(contact) {
  const details = [
    `Name: ${contact.name}`,
    `Business: ${contact.business}`,
    `Phone: ${contact.mobile}`,
    `Email: ${contact.email}`,
    `Website: ${contact.website}`
  ].join('\n\n');

  if (navigator.clipboard) {
    if (confirm('Copy contact details to clipboard?')) {
      navigator.clipboard.writeText(details)
        .then(() => alert('Details copied! Open your contacts app to paste them'))
        .catch(() => alert(details));
    } else {
      alert(details);
    }
  } else {
    alert(details);
  }
}

// ============================================
// EMAIL MODAL FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('emailModal');
  const triggerBtn = document.querySelector('.email-modal-trigger');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('emailForm');
  const formStatus = document.getElementById('formStatus');

  // Only initialize if modal elements exist on the page
  if (!modal || !triggerBtn || !closeBtn || !form) return;

  // Open modal
  triggerBtn.addEventListener('click', function(e) {
    e.preventDefault();
    modal.style.display = 'flex';
  });

  // Close modal functions
  function closeModal() {
    modal.style.display = 'none';
    form.reset();
    formStatus.textContent = '';
    formStatus.classList.remove('success-message', 'error-message');
  }

  closeBtn.addEventListener('click', closeModal);

  // Click outside modal content to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = 'All fields are required.';
      formStatus.classList.add('error-message');
      return;
    }

    // Disable submit button to prevent double submission
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    formStatus.textContent = 'Sending...';
    formStatus.classList.remove('error-message', 'success-message');

    // Prepare data for Formspree (replace with your own endpoint)
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);

    try {
      // 🔁 REPLACE THIS URL WITH YOUR FORMSPREE ENDPOINT
      const response = await fetch('https://formspree.io/f/mjgeonjq', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        formStatus.textContent = 'Thank you! Your message has been sent.';
        formStatus.classList.add('success-message');
        form.reset();
        setTimeout(closeModal, 2000); // Auto close after 2 seconds
      } else {
        const data = await response.json();
        if (data.errors) {
          formStatus.textContent = data.errors.map(error => error.message).join(', ');
        } else {
          formStatus.textContent = 'Oops! Something went wrong. Please try again.';
        }
        formStatus.classList.add('error-message');
      }
    } catch (error) {
      formStatus.textContent = 'Network error. Please check your connection.';
      formStatus.classList.add('error-message');
    } finally {
      submitBtn.disabled = false;
    }
  });
});