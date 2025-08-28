function toggleDetails(element) {
    const details = element.querySelector('.full-qualifications');
    const arrow = element.querySelector('.arrow');
    
    // Toggle the 'show' class to show/hide the full qualifications
    const isExpanded = details.classList.toggle('show');
    arrow.classList.toggle('rotate');

    // Accessibility: Update aria-expanded attribute based on visibility
    element.setAttribute('aria-expanded', isExpanded);
}


