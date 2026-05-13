const heroImage = document.querySelector("#heroImage");
const imageStage = document.querySelector(".image-stage");
const zoomPreview = document.querySelector(".zoom-preview");
const zoomCursor = document.querySelector(".zoom-cursor");
const thumbs = Array.from(document.querySelectorAll(".thumb"));
const previous = document.querySelector(".previous");
const next = document.querySelector(".next");
const specButton = document.querySelector("#specButton");
const faqItems = Array.from(document.querySelectorAll(".faq-item"));
const catalogueForm = document.querySelector(".catalogue-card");
const applicationTrack = document.querySelector(".application-track");
const appPrevious = document.querySelector(".app-prev");
const appNext = document.querySelector(".app-next");
const processTabs = Array.from(document.querySelectorAll(".process-tabs button"));
const processPrev = document.querySelector(".process-prev");
const processNext = document.querySelector(".process-next");
const processPrevOverlay = document.querySelector(".process-prev-overlay");
const processNextOverlay = document.querySelector(".process-next-overlay");
const contactForm = document.querySelector(".contact-form");
const modalLayer = document.querySelector("#modalLayer");
const modalCards = Array.from(document.querySelectorAll("[data-modal]"));
const modalOpeners = Array.from(document.querySelectorAll("[data-modal-open]"));
const modalClosers = Array.from(document.querySelectorAll("[data-modal-close]"));

let activeIndex = 0;
let modalCloseTimer;

// Zoom preview functionality
const ZOOM_SCALE = 2.5;
const ZOOM_SIZE = 180; // pixels

// Clamp: Restricts a value between a minimum and maximum range
// Purpose: Prevents values from exceeding specified boundaries (used for zoom cursor positioning)
function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

// Update Zoom Preview: Calculates and displays a zoomed section of the image based on mouse position
// Purpose: Creates an interactive zoom effect that follows the user's cursor over the product image
function updateZoomPreview(event) {
  if (!imageStage || !zoomPreview || !zoomCursor || !heroImage) return;

  const rect = imageStage.getBoundingClientRect();
  const x = clamp(event.clientX - rect.left, 0, rect.width);
  const y = clamp(event.clientY - rect.top, 0, rect.height);

  const zoomedWidth = rect.width * ZOOM_SCALE;
  const zoomedHeight = rect.height * ZOOM_SCALE;
  const maxOffsetX = zoomedWidth - ZOOM_SIZE;
  const maxOffsetY = zoomedHeight - ZOOM_SIZE;
  const offsetX = clamp(x * ZOOM_SCALE - ZOOM_SIZE / 2, 0, maxOffsetX);
  const offsetY = clamp(y * ZOOM_SCALE - ZOOM_SIZE / 2, 0, maxOffsetY);

  zoomCursor.style.left = `${x}px`;
  zoomCursor.style.top = `${y}px`;
  zoomPreview.style.backgroundImage = `url(${heroImage.src})`;
  zoomPreview.style.backgroundSize = `${zoomedWidth}px ${zoomedHeight}px`;
  zoomPreview.style.backgroundPosition = `-${offsetX}px -${offsetY}px`;
}

if (imageStage) {
  imageStage.addEventListener("mousemove", updateZoomPreview);
  imageStage.addEventListener("mouseleave", () => {
    if (zoomPreview) {
      zoomPreview.style.backgroundPosition = "0 0";
      zoomPreview.style.opacity = "0";
    }
    if (zoomCursor) {
      zoomCursor.style.display = "none";
    }
  });
  imageStage.addEventListener("mouseenter", (event) => {
    if (zoomPreview) {
      zoomPreview.style.opacity = "1";
    }
    if (zoomCursor) {
      zoomCursor.style.display = "flex";
    }
    updateZoomPreview(event);
  });
}

// Sync Zoom Image: Synchronizes the zoom preview with the currently selected hero image
// Purpose: Ensures the zoom preview displays the correct image and applies active filters
function syncZoomImage() {
  if (zoomPreview && heroImage) {
    zoomPreview.style.backgroundImage = `url(${heroImage.src})`;
    zoomPreview.className = `zoom-preview ${heroImage.className}`;
    zoomPreview.style.backgroundPosition = "0 0";
  }
}

// Initialize zoom preview on page load
syncZoomImage();

// Select Image: Updates the active gallery image and applies the selected filter
// Purpose: Allows users to switch between different product images/angles in the gallery
function selectImage(index) {
  activeIndex = (index + thumbs.length) % thumbs.length;
  const activeThumb = thumbs[activeIndex];

  thumbs.forEach((thumb) => thumb.classList.toggle("active", thumb === activeThumb));
  heroImage.className = "";

  const filter = activeThumb.dataset.filter;
  if (filter && filter !== "none") {
    heroImage.classList.add(filter);
  }

  syncZoomImage();
}

thumbs.forEach((thumb, index) => {
  thumb.addEventListener("click", () => selectImage(index));
});

previous.addEventListener("click", () => selectImage(activeIndex - 1));
next.addEventListener("click", () => selectImage(activeIndex + 1));

specButton.addEventListener("click", () => {
  document.querySelector("#technical-specs").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

const mobileFaqMediaQuery = window.matchMedia("(max-width: 720px)");

function getOpenFaqArrowSrc() {
  return mobileFaqMediaQuery.matches ? "assets/phoneUpArrow.png" : "assets/upArrow.png";
}

function updateFaqArrowSrc(arrow, isOpen) {
  if (!arrow) return;
  if (isOpen) {
    arrow.src = getOpenFaqArrowSrc();
    arrow.alt = "Collapse";
  } else {
    arrow.src = "assets/downArrow.png";
    arrow.alt = "Expand";
  }
}

function refreshFaqArrows() {
  faqItems.forEach((item) => {
    const arrow = item.querySelector(".faq-arrow");
    updateFaqArrowSrc(arrow, item.classList.contains("open"));
  });
}

faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  const arrow = button.querySelector(".faq-arrow");

  button.addEventListener("click", () => {
    faqItems.forEach((currentItem) => {
      if (currentItem !== item) {
        currentItem.classList.remove("open");
        const currentArrow = currentItem.querySelector(".faq-arrow");
        updateFaqArrowSrc(currentArrow, false);
      }
    });

    item.classList.toggle("open");
    updateFaqArrowSrc(arrow, item.classList.contains("open"));
  });
});

refreshFaqArrows();
if (typeof mobileFaqMediaQuery.addEventListener === "function") {
  mobileFaqMediaQuery.addEventListener("change", refreshFaqArrows);
} else if (typeof mobileFaqMediaQuery.addListener === "function") {
  mobileFaqMediaQuery.addListener(refreshFaqArrows);
}

catalogueForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = catalogueForm.querySelector("button");
  button.textContent = "Request Sent";
  setTimeout(() => {
    button.textContent = "Request Catalogue";
  }, 1800);
});

// Scroll Applications: Smoothly scrolls the applications carousel left or right
// Purpose: Enables users to browse through different industry applications
function scrollApplications(direction) {
  const distance = applicationTrack.querySelector(".application-card").offsetWidth + 12;
  applicationTrack.scrollBy({
    left: direction * distance,
    behavior: "smooth",
  });
}

const testimonialTrack = document.querySelector(".testimonial-track");
const testimonialCards = Array.from(document.querySelectorAll(".testimonial-card"));

function selectTestimonial(card) {
  if (!card || !testimonialTrack) return;
  testimonialCards.forEach((item) => item.classList.toggle("active", item === card));
  card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

let isTestimonialDown = false;
let testimonialStartX = 0;
let testimonialScrollLeft = 0;
let testimonialDragged = false;

if (testimonialTrack) {
  testimonialTrack.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    isTestimonialDown = true;
    testimonialDragged = false;
    testimonialTrack.classList.add("dragging");
    const rect = testimonialTrack.getBoundingClientRect();
    testimonialStartX = event.pageX - rect.left;
    testimonialScrollLeft = testimonialTrack.scrollLeft;
    event.preventDefault();
  });

  testimonialTrack.addEventListener("mousemove", (event) => {
    if (!isTestimonialDown) return;
    const rect = testimonialTrack.getBoundingClientRect();
    const x = event.pageX - rect.left;
    const walk = x - testimonialStartX;
    if (Math.abs(walk) > 5) {
      testimonialDragged = true;
    }
    testimonialTrack.scrollLeft = testimonialScrollLeft - walk;
  });

  testimonialTrack.addEventListener("mouseleave", () => {
    if (!isTestimonialDown) return;
    isTestimonialDown = false;
    testimonialTrack.classList.remove("dragging");
  });

  document.addEventListener("mouseup", () => {
    if (!isTestimonialDown) return;
    isTestimonialDown = false;
    testimonialTrack.classList.remove("dragging");
    setTimeout(() => {
      testimonialDragged = false;
    }, 0);
  });
}

appPrevious.addEventListener("click", () => scrollApplications(-1));
appNext.addEventListener("click", () => scrollApplications(1));

testimonialCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (testimonialDragged) {
      event.preventDefault();
      return;
    }
    selectTestimonial(card);
  });
});

const processStepData = [
  {
    title: "High-Grade Raw Material Selection",
    text: "Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.",
    bullets: ["PE100 grade material", "Optimal molecular weight distribution"],
    image: "assets/hdpe-installation.png",
    alt: "HDPE pipe material selection process",
  },
  {
    title: "Precision Extrusion Control",
    text: "Controlled melt temperature and screw speed deliver consistent pipe density and exceptional surface finish.",
    bullets: ["Uniform melt flow", "Accurate extrusion profile"],
    image: "assets/hdpe-installation.png",
    alt: "HDPE pipe extrusion process",
  },
  {
    title: "Rapid Cooling & Stabilization",
    text: "A calibrated water bath cools the pipe quickly to lock in dimensional stability and reduce internal stresses.",
    bullets: ["Stable roundness", "Consistent wall thickness"],
    image: "assets/hdpe-installation.png",
    alt: "Pipe cooling process",
  },
  {
    title: "Precision Sizing",
    text: "Automated sizing equipment ensures every pipe meets exact diameter tolerances for a perfect fit.",
    bullets: ["Tight tolerance control", "Smooth surface finish"],
    image: "assets/hdpe-installation.png",
    alt: "Pipe sizing process",
  },
  {
    title: "Stringent Quality Control",
    text: "Every batch undergoes rigorous inspection, pressure testing, and visual checks before release.",
    bullets: ["Pressure integrity tests", "Visual and dimensional checks"],
    image: "assets/hdpe-installation.png",
    alt: "Quality control inspection",
  },
  {
    title: "Marking & Identification",
    text: "Clear product marking and traceability labels are added to each pipe for easy installation and compliance.",
    bullets: ["Batch identification", "Regulatory markings"],
    image: "assets/hdpe-installation.png",
    alt: "Pipe marking process",
  },
  {
    title: "Accurate Cutting & Lengthing",
    text: "Advanced cutting systems deliver clean ends and exact lengths for every customer order.",
    bullets: ["Precision cut lengths", "Minimal material waste"],
    image: "assets/hdpe-installation.png",
    alt: "Pipe cutting process",
  },
  {
    title: "Secure Packaging",
    text: "Finished pipes are bundled and packaged safely for transport, reducing damage in transit.",
    bullets: ["Robust packaging", "Safe transport handling"],
    image: "assets/hdpe-installation.png",
    alt: "Pipe packaging process",
  },
];

let activeProcessIndex = 0;

// Update Process Step: Updates the manufacturing process step content and interface
// Purpose: Allows users to navigate through different stages of the HDPE pipe manufacturing process
function updateProcessStep(index) {
  activeProcessIndex = (index + processTabs.length) % processTabs.length;

  processTabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === activeProcessIndex;
    tab.classList.toggle("active", isActive);
    tab.dataset.step = `Step ${tabIndex + 1}/${processTabs.length}: `;
  });

  const stepData = processStepData[activeProcessIndex];
  const contentPanel = document.querySelector(".process-content > div");
  const image = document.querySelector(".process-content img");

  contentPanel.querySelector("h3").textContent = stepData.title;
  contentPanel.querySelector("p").textContent = stepData.text;
  contentPanel.querySelector("ul").innerHTML = stepData.bullets
    .map((item) => `<li>${item}</li>`)
    .join("");
  image.src = stepData.image;
  image.alt = stepData.alt;

  processPrev.disabled = activeProcessIndex === 0;
  processNext.disabled = activeProcessIndex === processTabs.length - 1;

  // Also update overlay buttons
  if (processPrevOverlay) {
    processPrevOverlay.disabled = activeProcessIndex === 0;
  }
  if (processNextOverlay) {
    processNextOverlay.disabled = activeProcessIndex === processTabs.length - 1;
  }
}

processTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => updateProcessStep(index));
});

processPrev.addEventListener("click", () => updateProcessStep(activeProcessIndex - 1));
processNext.addEventListener("click", () => updateProcessStep(activeProcessIndex + 1));

// Overlay navigation buttons for desktop
if (processPrevOverlay) {
  processPrevOverlay.addEventListener("click", () => updateProcessStep(activeProcessIndex - 1));
}
if (processNextOverlay) {
  processNextOverlay.addEventListener("click", () => updateProcessStep(activeProcessIndex + 1));
}

updateProcessStep(activeProcessIndex);

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = contactForm.querySelector("button");
  button.textContent = "Quote Requested";
  setTimeout(() => {
    button.textContent = "Request Custom Quote";
  }, 1800);
});

// Open Modal: Displays a modal dialog with smooth opening animation
// Purpose: Shows contact forms, quotes, or catalogues in an overlay modal
function openModal(name) {
  clearTimeout(modalCloseTimer);
  modalCards.forEach((card) => {
    card.classList.toggle("active", card.dataset.modal === name);
  });

  modalLayer.classList.remove("closing");
  modalLayer.classList.add("open", "opening");
  modalLayer.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const activeCard = modalCards.find((card) => card.dataset.modal === name);
  setTimeout(() => modalLayer.classList.remove("opening"), 260);
  setTimeout(() => activeCard.querySelector("input, select, button").focus(), 60);
}

// Close Modal: Closes the currently open modal with smooth closing animation
// Purpose: Removes the modal overlay and restores normal page interaction
function closeModal() {
  if (!modalLayer.classList.contains("open") || modalLayer.classList.contains("closing")) {
    return;
  }

  modalLayer.classList.remove("opening");
  modalLayer.classList.add("closing");
  modalLayer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  modalCloseTimer = setTimeout(() => {
    modalLayer.classList.remove("open", "closing");
  }, 190);
}

modalOpeners.forEach((opener) => {
  opener.addEventListener("click", (event) => {
    event.preventDefault();
    openModal(opener.dataset.modalOpen);
  });
});

modalClosers.forEach((closer) => {
  closer.addEventListener("click", closeModal);
});

modalCards.forEach((card) => {
  const form = card.querySelector("form");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector(".modal-actions button");
    if (button.disabled) {
      return;
    }

    const originalText = button.textContent;
    button.textContent = card.dataset.modal === "quote" ? "Submitted" : "Sent";
    setTimeout(() => {
      button.textContent = originalText;
      closeModal();
    }, 900);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modalLayer.classList.contains("open")) {
    closeModal();
  }
});

// Sticky Header Functionality
const stickyHeader = document.querySelector(".sticky-header");
const siteHeader = document.querySelector(".site-header");
let lastScrollY = 0;
let scrollDirection = "down";

// Update Sticky Header: Controls visibility of the sticky navigation header based on scroll position
// Purpose: Shows/hides the sticky header intelligently when user scrolls past the main header
function updateStickyHeader() {
  const currentScrollY = window.scrollY;

  // Show sticky header when scrolling past the site header (first fold)
  const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
  const triggerPoint = headerHeight;

  if (currentScrollY > triggerPoint) {
    // User has scrolled past the main header
    if (scrollDirection === "down") {
      stickyHeader.classList.add("visible");
    }
  } else {
    // User is at the top, hide sticky header
    stickyHeader.classList.remove("visible");
  }

  // Detect scroll direction
  if (currentScrollY > lastScrollY) {
    scrollDirection = "down";
  } else if (currentScrollY < lastScrollY) {
    scrollDirection = "up";
    // Show sticky header when scrolling up
    if (currentScrollY > triggerPoint) {
      stickyHeader.classList.add("visible");
    }
  }

  lastScrollY = currentScrollY;
}

// Add scroll listener with throttling for better performance
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateStickyHeader();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
