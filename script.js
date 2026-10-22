const SCROLL_POSITION_KEY = "djdream-scroll-y";
const BOOKING_FORM_DRAFT_KEY = "djdream-booking-draft";
const SERVICE_LOCATION_KEY = "djdream-service-location";
const revealItems = document.querySelectorAll(".reveal");

const revealElement = (element) => {
  element.classList.add("in-view");
  revealObservers.forEach((observer) => observer.unobserve(element));
};

const getRevealOptions = (element) => {
  if (element.classList.contains("characters-content")) {
    return { threshold: 0, rootMargin: "0px 0px 28% 0px" };
  }

  return { threshold: 0.1, rootMargin: "0px 0px 12% 0px" };
};

const getRevealLeadOffset = (element) => {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  if (element.classList.contains("characters-content")) {
    return viewportHeight * 0.28;
  }

  return viewportHeight * 0.12;
};

const isRevealTargetInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  return rect.bottom > 0 && rect.top < viewportHeight + getRevealLeadOffset(element);
};

const revealVisibleElements = () => {
  revealItems.forEach((item) => {
    if (!item.classList.contains("in-view") && isRevealTargetInViewport(item)) {
      revealElement(item);
    }
  });
};

const revealObservers = new Map();

const observeRevealItem = (item) => {
  const options = getRevealOptions(item);
  const optionsKey = JSON.stringify(options);

  if (!revealObservers.has(optionsKey)) {
    revealObservers.set(
      optionsKey,
      new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          revealElement(entry.target);
          observer.unobserve(entry.target);
        });
      }, options),
    );
  }

  revealObservers.get(optionsKey).observe(item);
};

if (revealItems.length > 0) {
  revealItems.forEach((item) => {
    if (item.classList.contains("in-view")) {
      return;
    }

    if (isRevealTargetInViewport(item)) {
      revealElement(item);
      return;
    }

    observeRevealItem(item);
  });
}

const saveScrollPosition = () => {
  sessionStorage.setItem(SCROLL_POSITION_KEY, String(Math.round(window.scrollY)));
};

const restoreScrollPosition = () => {
  const saved = sessionStorage.getItem(SCROLL_POSITION_KEY);
  if (saved === null) {
    return;
  }

  const scrollY = Number(saved);
  if (!Number.isFinite(scrollY) || scrollY < 0) {
    return;
  }

  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, scrollY);
  root.style.scrollBehavior = previousBehavior;
};

const shouldRestoreScrollPosition = () => {
  const navEntry = performance.getEntriesByType("navigation")[0];
  return navEntry?.type === "reload" || navEntry?.type === "back_forward";
};

const getNavigationType = () => performance.getEntriesByType("navigation")[0]?.type || "navigate";

const shouldRestoreBookingFormDraft = () => getNavigationType() === "back_forward";

const initBookingFormDraftOnLoad = () => {
  if (getNavigationType() === "reload") {
    clearBookingFormDraft();
    return;
  }

  if (!shouldRestoreBookingFormDraft()) {
    return;
  }

  if (restoreBookingFormDraft) {
    restoreBookingFormDraft();
    return;
  }

  if (!bookingForm) {
    return;
  }

  const rawDraft = sessionStorage.getItem(BOOKING_FORM_DRAFT_KEY);
  if (!rawDraft) {
    return;
  }

  try {
    applySimpleBookingFormDraft(JSON.parse(rawDraft));
  } catch {
    sessionStorage.removeItem(BOOKING_FORM_DRAFT_KEY);
  }
};

const initScrollRestore = () => {
  if (!shouldRestoreScrollPosition()) {
    return;
  }

  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  restoreScrollPosition();
  revealVisibleElements();
};

if ("scrollRestoration" in history) {
  history.scrollRestoration = "auto";
}

let scrollSaveRaf = 0;
window.addEventListener(
  "scroll",
  () => {
    if (scrollSaveRaf) {
      return;
    }

    scrollSaveRaf = requestAnimationFrame(() => {
      scrollSaveRaf = 0;
      saveScrollPosition();
    });
  },
  { passive: true },
);

window.addEventListener("pagehide", saveScrollPosition);

window.addEventListener("pageshow", (event) => {
  if (!shouldRestoreScrollPosition() && !event.persisted) {
    return;
  }

  requestAnimationFrame(() => {
    restoreScrollPosition();
    revealVisibleElements();
    requestAnimationFrame(() => {
      restoreScrollPosition();
      revealVisibleElements();
    });
  });
});

initScrollRestore();
document.addEventListener("DOMContentLoaded", initScrollRestore);
window.addEventListener("load", initScrollRestore);

const scrollToTopInstant = () => {
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousBehavior;
  sessionStorage.setItem(SCROLL_POSITION_KEY, "0");
};

const BOOKING_INBOX_ENDPOINT = "/api/booking";

const menuButton = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const yearSpan = document.querySelector("#year");
const bookingForm = document.querySelector(".booking-form");
const heroCarousel = document.querySelector("#hero-carousel");
const heroCarouselTrack = document.querySelector("#hero-carousel-track");
const eventDateInput = document.querySelector("#event-date") || document.createElement("input");
const availabilityTrigger = document.querySelector("#availability-trigger");
const bookingFlow = document.querySelector("#booking-flow");
const heroCalendar = document.querySelector("#hero-calendar");
const calendarGrid = document.querySelector("#calendar-grid");
const calendarMonthLabel = document.querySelector("#calendar-month-label");
const calendarPrevButton = document.querySelector("#calendar-prev");
const calendarNextButton = document.querySelector("#calendar-next");
const calendarSelectionText = document.querySelector("#calendar-selection-text");
const availabilityPanel = document.querySelector("#availability-panel");
const availabilityStatus = document.querySelector("#availability-status");
const availabilityPackage = document.querySelector("#availability-package");
const availabilityTime = document.querySelector("#availability-time");
const availabilityCharactersFields = document.querySelector("#availability-characters-fields");
const availabilityNote = document.querySelector("#availability-note");
const availabilityContinueButton = document.querySelector("#availability-continue");
const bookingSection = document.querySelector("#booking");
const eventPackageInput = document.querySelector("#event-package") || document.createElement("select");
const eventTimeInput = document.querySelector("#event-time") || document.createElement("select");
const eventTypeInput = document.querySelector("#event-type");
const eventTypeOtherWrap = document.querySelector("#event-type-other-wrap");
const eventTypeOtherInput = document.querySelector("#event-type-other");
const eventCharactersFields =
  document.querySelector("#event-characters-fields") || document.createElement("div");
const eventCharactersNote = document.querySelector("#event-characters-note");
const packageButtons = document.querySelectorAll(".pricing-grid .price-card .btn");
const siteHeader = document.querySelector(".site-header");
const brandLinks = document.querySelectorAll(".brand, .hero-brand");
const locationModal = document.querySelector("#location-modal");
const locationSwitchButton = document.querySelector("#location-switch-btn");
const serviceLocationInput = document.querySelector("#service-location");
const serviceLocationChangeHandlers = [];

const SERVICE_LOCATIONS = {
  "newburgh-hudson": {
    label: "Newburgh-Hudson Valley, NY",
    navLabel: "Newburgh-Hudson Valley",
    servingArea: "the Newburgh-Hudson Valley",
    pillarTitle: "Hudson Valley rooted",
    pillarText: "Home parties, venues, and community events across NY",
    coverage: "Private and public event coverage across Newburgh-Hudson Valley, NY.",
    bookingPoint: "Newburgh-Hudson Valley, NY private and public event service",
  },
  baltimore: {
    label: "Baltimore, MD",
    navLabel: "Baltimore, MD",
    servingArea: "Baltimore, MD",
    pillarTitle: "Baltimore rooted",
    pillarText: "Home parties, venues, and community events across MD",
    coverage: "Private and public event coverage across Baltimore, MD.",
    bookingPoint: "Baltimore, MD private and public event service",
  },
};

const getSavedServiceLocation = () => {
  const saved = localStorage.getItem(SERVICE_LOCATION_KEY);
  return saved && SERVICE_LOCATIONS[saved] ? saved : "";
};

const applyServiceLocation = (locationId) => {
  const location = SERVICE_LOCATIONS[locationId];
  if (!location) {
    return;
  }

  document.querySelectorAll("[data-location-copy]").forEach((element) => {
    const key = element.dataset.locationCopy;
    if (location[key]) {
      element.textContent = location[key];
      if (element.classList.contains("brand-location")) {
        element.hidden = false;
      }
    }
  });

  if (serviceLocationInput) {
    serviceLocationInput.value = locationId;
  }

  document.documentElement.dataset.serviceLocation = locationId;
  serviceLocationChangeHandlers.forEach((handler) => handler(locationId));
};

const closeLocationModal = () => {
  if (!locationModal) {
    return;
  }

  locationModal.hidden = true;
  document.body.classList.remove("location-modal-open");
};

const openLocationModal = () => {
  if (!locationModal) {
    return;
  }

  locationModal.hidden = false;
  document.body.classList.add("location-modal-open");
  locationModal.querySelector("button[data-location]")?.focus();
};

const selectServiceLocation = (locationId) => {
  if (!SERVICE_LOCATIONS[locationId]) {
    return;
  }

  localStorage.setItem(SERVICE_LOCATION_KEY, locationId);
  applyServiceLocation(locationId);
  closeLocationModal();
  scrollToTopInstant();
};

const initServiceLocationPicker = () => {
  const savedLocation = getSavedServiceLocation();
  if (savedLocation) {
    applyServiceLocation(savedLocation);
  } else {
    openLocationModal();
  }

  locationModal?.querySelectorAll("button[data-location]").forEach((button) => {
    button.addEventListener("click", () => {
      selectServiceLocation(button.dataset.location);
    });
  });

  locationSwitchButton?.addEventListener("click", openLocationModal);
};

initServiceLocationPicker();

const INQUIRY_EVENT_TYPES = [
  "birthday",
  "school",
  "corporate",
  "playdate",
  "private",
  "wedding",
  "dance",
  "other",
];
const INQUIRY_NO_PACKAGE = ["dance", "other", "wedding"];
const INQUIRY_EVENT_LABELS = {
  birthday: "Birthday Party",
  school: "School Event",
  corporate: "Corporate / Community Event",
  playdate: "Children's Playdate",
  private: "Private Event",
  wedding: "Wedding / Vow Renewal",
  dance: "Dance Class / Workshop / Performance",
  other: "Other",
};
const BALTIMORE_INQUIRY_CHARACTERS = [
  "The Goggle Pal (Devin)",
  "The Goggle Pal (Rob)",
  "The Azure Pup",
];
const INQUIRY_LOCATION_FIELDS = {
  birthday: "b-venue",
  school: "s-venue",
  corporate: "c-venue",
  playdate: "p-location",
  private: "pr-venue",
  wedding: "w-venue",
  dance: "d-location",
  other: "o-location",
};
const INQUIRY_DATE_FIELDS = {
  birthday: "b-date",
  school: "s-date",
  corporate: "c-date",
  playdate: "p-date",
  private: "pr-date",
  wedding: "w-date",
  dance: "d-date",
  other: "o-date",
};
const INQUIRY_TIME_FIELDS = {
  birthday: "b-time",
  school: "s-time",
  corporate: "c-time",
  playdate: "p-time",
  private: "pr-time",
  wedding: "w-ceremony",
  dance: "d-time",
  other: "o-time",
};
const INQUIRY_DETAIL_FIELDS = {
  birthday: [
    ["Celebrant's Name", "b-child-name"],
    ["Celebrant's Age", "b-child-age"],
    ["Event Date", "b-date"],
    ["Preferred Start Time", "b-time"],
    ["Estimated Total Guests", "b-guests"],
    ["Estimated Number of Children", "b-children"],
    ["Age Range of Children", "b-age-range"],
    ["Location (Venue Name and Address)", "b-venue"],
    ["Indoor or Outdoor", "b-indoor"],
    ["Is this a surprise?", "b-surprise"],
  ],
  school: [
    ["School Name", "s-school"],
    ["Your Title or Role", "s-title"],
    ["Event Date", "s-date"],
    ["Preferred Start Time", "s-time"],
    ["Event Format", "s-format"],
    ["Number of Classrooms or Students", "s-classrooms"],
    ["Grade Levels", "s-grades"],
    ["During school hours or after school?", "s-hours"],
    ["Location (Venue Name and Address)", "s-venue"],
    ["Setup or access restrictions at the school?", "s-restrictions"],
    ["Will media or press be present?", "s-media"],
  ],
  corporate: [
    ["Organization or Company Name", "c-org"],
    ["Your Title or Role", "c-role"],
    ["Event Date", "c-date"],
    ["Preferred Start Time", "c-time"],
    ["Preferred End Time", "c-endtime"],
    ["Event Type", "c-type"],
    ["Expected Attendance", "c-attendance"],
    ["Is this event open to the public?", "c-public"],
    ["Interested in bilingual programming?", "c-bilingual"],
    ["Budget Range", "c-budget"],
    ["Location (Venue Name and Address)", "c-venue"],
    ["Will a coordinator be on-site day of?", "c-coordinator"],
    ["Will media or press be present?", "c-media"],
    ["Setup or venue restrictions?", "c-restrictions"],
  ],
  playdate: [
    ["Child's Name and Age", "p-child"],
    ["Number of Children", "p-count"],
    ["Event Date", "p-date"],
    ["Preferred Start Time", "p-time"],
    ["Location (Venue Name and Address)", "p-location"],
    ["Indoor or Outdoor", "p-indoor"],
    ["Any special themes or activities requested?", "p-theme"],
  ],
  private: [
    ["Event Type", "pr-subtype"],
    ["Event Date", "pr-date"],
    ["Preferred Start Time", "pr-time"],
    ["Estimated Total Guests", "pr-guests"],
    ["Estimated Number of Children", "pr-children"],
    ["Age Range of Children", "pr-age-range"],
    ["Location (Venue Name and Address)", "pr-venue"],
    ["Indoor or Outdoor", "pr-indoor"],
    ["Is there a theme?", "pr-theme"],
  ],
  wedding: [
    ["Partner Names", "w-names"],
    ["Event Date", "w-date"],
    ["Ceremony Start Time", "w-ceremony"],
    ["Reception Start Time", "w-reception"],
    ["Expected Number of Guests", "w-guests"],
    ["What role would you like D&J DREAM to play?", "w-role"],
    ["Children attending?", "w-children"],
    ["Budget Range", "w-budget"],
    ["Location (Venue Name and Address)", "w-venue"],
    ["Do you have a wedding coordinator?", "w-coordinator"],
    ["Venue restrictions we should know about?", "w-restrictions"],
  ],
  dance: [
    ["Type of Engagement", "d-type"],
    ["Date", "d-date"],
    ["Preferred Start Time", "d-time"],
    ["Age Group of Participants", "d-age"],
    ["Number of Participants", "d-participants"],
    ["Duration per Session", "d-duration"],
    ["Location", "d-location"],
    ["Is this for a recital, showcase, or specific event?", "d-recital"],
    ["Do you need costumes or props?", "d-costumes"],
    ["Performer appearance preference", "d-appearance"],
  ],
  other: [
    ["Please describe your event", "o-describe"],
    ["Event Date", "o-date"],
    ["Preferred Start Time", "o-time"],
    ["Location (Venue Name and Address)", "o-location"],
    ["Budget Range", "o-budget"],
  ],
};
const INQUIRY_DETAIL_TITLES = {
  birthday: "Birthday Details",
  school: "School Event Details",
  corporate: "Corporate / Community Event Details",
  playdate: "Playdate Details",
  private: "Private Event Details",
  wedding: "Wedding / Vow Renewal Details",
  dance: "Dance Event Details",
  other: "Other Event Details",
};

const readInquiryValue = (id) => {
  const element = id ? document.getElementById(id) : null;
  if (!element) {
    return "";
  }
  return String(element.value || "").trim();
};

const displayInquiryValue = (value) => (value ? value : "Not provided");

const checkedInquiryLabels = (selector) =>
  Array.from(document.querySelectorAll(selector))
    .filter((input) => input.checked)
    .map((input) => input.closest("label")?.textContent.replace(/\s+/g, " ").trim() || input.value);

const inquiryFieldsFromPairs = (pairs) =>
  pairs.map(([label, id]) => ({ label, value: displayInquiryValue(readInquiryValue(id)) }));

const showInquiryEventType = (type, { scroll = true } = {}) => {
  if (!INQUIRY_EVENT_TYPES.includes(type)) {
    return;
  }

  document.querySelectorAll(".booking-form .event-btn").forEach((button) => {
    const selected = button.dataset.type === type;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", selected ? "true" : "false");
  });

  const eventTypeValue = document.getElementById("event-type-value");
  if (eventTypeValue) {
    eventTypeValue.value = type;
  }

  INQUIRY_EVENT_TYPES.forEach((eventName) => {
    document.getElementById(`section-${eventName}`)?.classList.add("inquiry-hidden");
  });
  document.getElementById(`section-${type}`)?.classList.remove("inquiry-hidden");

  const packageSection = document.getElementById("section-package");
  const corpSection = document.getElementById("section-corp-chars");
  if (INQUIRY_NO_PACKAGE.includes(type)) {
    packageSection?.classList.add("inquiry-hidden");
    corpSection?.classList.add("inquiry-hidden");
  } else if (type === "corporate") {
    packageSection?.classList.add("inquiry-hidden");
    corpSection?.classList.remove("inquiry-hidden");
  } else {
    packageSection?.classList.remove("inquiry-hidden");
    corpSection?.classList.add("inquiry-hidden");
  }

  document.getElementById("details-section")?.classList.remove("inquiry-hidden");
  document.getElementById("section-additional")?.classList.remove("inquiry-hidden");

  const additionalStep = document.getElementById("additional-step");
  if (additionalStep) {
    additionalStep.textContent = INQUIRY_NO_PACKAGE.includes(type) ? "4" : "5";
  }

  if (scroll) {
    window.setTimeout(() => {
      document.getElementById("details-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
};

const syncInquiryCharacters = () => {
  const isBaltimore = document.documentElement.dataset.serviceLocation === "baltimore";

  document.querySelectorAll(".booking-form select.inquiry-character").forEach((select) => {
    const current = select.value;
    select.querySelectorAll("option[data-baltimore-character]").forEach((option) => option.remove());
    if (isBaltimore) {
      const customOption = Array.from(select.options).find((option) => option.value === "Custom Character");
      BALTIMORE_INQUIRY_CHARACTERS.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        option.dataset.baltimoreCharacter = "true";
        if (customOption) {
          select.insertBefore(option, customOption);
        } else {
          select.append(option);
        }
      });
    }
    const stillThere = Array.from(select.options).some((option) => option.value === current);
    select.value = stillThere ? current : "";
  });

  const corpGrid = document.getElementById("corp-char-grid");
  if (!corpGrid) {
    return;
  }

  const preserved = new Set(
    Array.from(corpGrid.querySelectorAll("input[data-baltimore-character]:checked")).map((input) => input.value),
  );
  corpGrid.querySelectorAll("[data-baltimore-character]").forEach((element) => element.remove());
  if (!isBaltimore) {
    return;
  }

  const customLabel = corpGrid.querySelector("[data-custom-char]");
  BALTIMORE_INQUIRY_CHARACTERS.forEach((name) => {
    const label = document.createElement("label");
    label.className = "dance-style-item";
    label.dataset.baltimoreCharacter = "true";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "corp-char";
    input.value = name;
    input.dataset.baltimoreCharacter = "true";
    input.checked = preserved.has(name);
    label.append(input, document.createTextNode(` ${name}`));
    if (customLabel) {
      corpGrid.insertBefore(label, customLabel);
    } else {
      corpGrid.append(label);
    }
  });
};

syncInquiryCharacters();
serviceLocationChangeHandlers.push(syncInquiryCharacters);

const getBookingFormDraft = () => {
  if (!bookingForm) {
    return null;
  }

  const fields = [];
  bookingForm.querySelectorAll("input, select, textarea").forEach((element) => {
    if (element.id === "service-location") {
      return;
    }
    if (element.type === "checkbox" || element.type === "radio") {
      fields.push({
        id: element.id || "",
        name: element.name || "",
        value: element.value,
        checked: element.checked,
      });
      return;
    }
    fields.push({
      id: element.id || "",
      name: element.name || "",
      value: element.value,
    });
  });

  return {
    version: 2,
    eventType: readInquiryValue("event-type-value"),
    fields,
  };
};

const saveBookingFormDraft = () => {
  if (!bookingForm) {
    return;
  }

  const draft = getBookingFormDraft();
  const hasContent =
    Boolean(draft?.eventType) ||
    Boolean(draft?.fields?.some((field) => field.checked || Boolean(field.value)));

  if (hasContent) {
    sessionStorage.setItem(BOOKING_FORM_DRAFT_KEY, JSON.stringify(draft));
    return;
  }

  sessionStorage.removeItem(BOOKING_FORM_DRAFT_KEY);
};

const clearBookingFormDraft = () => {
  sessionStorage.removeItem(BOOKING_FORM_DRAFT_KEY);
};

const applyInquiryDraft = (draft) => {
  if (!bookingForm || !draft || draft.version !== 2 || !Array.isArray(draft.fields)) {
    return false;
  }

  draft.fields.forEach((field) => {
    if (field.id === "service-location") {
      return;
    }
    if (field.id) {
      const element = document.getElementById(field.id);
      if (!element) {
        return;
      }
      if (element.type === "checkbox" || element.type === "radio") {
        element.checked = Boolean(field.checked);
        return;
      }
      element.value = field.value || "";
      return;
    }
    if (!field.name) {
      return;
    }
    const matches = bookingForm.querySelectorAll(`[name="${CSS.escape(field.name)}"]`);
    const element = Array.from(matches).find((candidate) => candidate.value === field.value);
    if (element && (element.type === "checkbox" || element.type === "radio")) {
      element.checked = Boolean(field.checked);
    }
  });

  if (draft.eventType) {
    showInquiryEventType(draft.eventType, { scroll: false });
  }
  return true;
};

const applySimpleBookingFormDraft = (draft) => {
  if (applyInquiryDraft(draft)) {
    return;
  }
  if (!bookingForm || !draft) {
    return;
  }

  ["name", "email", "phone", "event-date", "event-type", "event-type-other", "message"].forEach((fieldName) => {
    const field = bookingForm.elements.namedItem(fieldName);
    if (field && draft[fieldName] && field.type !== "checkbox" && field.type !== "radio") {
      field.value = draft[fieldName];
    }
  });

  syncEventTypeOtherField();
};

const syncEventTypeOtherField = () => {
  if (!eventTypeInput || !eventTypeOtherWrap || !eventTypeOtherInput) {
    return;
  }

  const isOther = eventTypeInput.value === "other";
  eventTypeOtherWrap.classList.toggle("is-visible", isOther);
  eventTypeOtherInput.required = isOther;

  if (!isOther) {
    eventTypeOtherInput.value = "";
  }
};

let restoreBookingFormDraft = null;

brandLinks.forEach((brandLink) => {
  brandLink.addEventListener("click", (event) => {
    if (event.target.closest(".brand-location")) {
      event.preventDefault();
      openLocationModal();
      closeMobileNav();
      return;
    }

    event.preventDefault();
    scrollToTopInstant();
    closeMobileNav();
  });
});

const closeMobileNav = () => {
  if (navLinks) {
    navLinks.classList.remove("open");
  }
  if (menuButton) {
    menuButton.setAttribute("aria-expanded", "false");
  }
};

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });
}

if (yearSpan) {
  yearSpan.textContent = String(new Date().getFullYear());
}

if (
  availabilityTrigger &&
  bookingFlow &&
  heroCalendar &&
  calendarGrid &&
  calendarMonthLabel &&
  calendarPrevButton &&
  calendarNextButton &&
  calendarSelectionText &&
  availabilityPanel &&
  availabilityStatus &&
  availabilityPackage &&
  availabilityTime &&
  availabilityCharactersFields &&
  availabilityNote &&
  availabilityContinueButton &&
  eventDateInput &&
  eventPackageInput &&
  eventTimeInput &&
  eventCharactersFields
) {
  const packageCatalog = {
    starter: {
      label: "Enchant Starter",
      maxCharacters: 1,
      times: ["10:00 AM", "12:30 PM", "3:00 PM"],
    },
    signature: {
      label: "Dream Signature",
      maxCharacters: 2,
      times: ["10:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"],
    },
    grand: {
      label: "Grand Celebration",
      maxCharacters: 3,
      times: ["11:00 AM", "2:00 PM", "5:30 PM"],
    },
  };

  const baseCharacterCatalog = [
    { value: "ice-queen", label: "The Ice Queen" },
    { value: "bayou-princess", label: "The Bayou Princess" },
    { value: "desert-princess", label: "The Desert Princess" },
    { value: "tower-princess", label: "The Tower Princess" },
    { value: "sea-song-princess", label: "The Mermaid Princess" },
    { value: "golden-belle", label: "The Golden Belle" },
    { value: "ballroom-princess", label: "The Ballroom Princess" },
    { value: "island-voyager", label: "The Island Voyager" },
    { value: "miracle-girl", label: "The Miracle Girl" },
    { value: "rescue-captain", label: "The Rescue Captain" },
    { value: "web-hero", label: "The Web Hero" },
    { value: "jumpman-hero", label: "The Jumpman Hero" },
    { value: "sky-guardian", label: "The Sky Guardian" },
    { value: "kingdom-guardian", label: "The Kingdom Guardian" },
    { value: "night-sentinel", label: "The Night Sentinel" },
    { value: "custom-characters", label: "Custom Characters" },
  ];

  const baltimoreCharacterCatalog = [
    { value: "goggle-pal-devin", label: "The Goggle Pal (Devin)" },
    { value: "azure-pup", label: "The Azure Pup" },
    { value: "goggle-pal-rob", label: "The Goggle Pal (Rob)" },
  ];

  const getCharacterCatalog = () => {
    if (document.documentElement.dataset.serviceLocation !== "baltimore") {
      return baseCharacterCatalog;
    }

    const catalog = [...baseCharacterCatalog];
    catalog.splice(catalog.length - 1, 0, ...baltimoreCharacterCatalog);
    return catalog;
  };

  const blackoutDates = new Set(["2026-11-27", "2026-12-25"]);
  const unavailableWeekdays = new Set([1]); // Mondays
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  let visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDateKey = "";
  let selectedPackageId = "";

  const populateCharacterSelect = (selectEl) => {
    selectEl.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select character";
    selectEl.append(defaultOption);
    getCharacterCatalog().forEach((character) => {
      const opt = document.createElement("option");
      opt.value = character.value;
      opt.textContent = character.label;
      selectEl.append(opt);
    });
  };

  const getCharacterDropdownSelections = (container) =>
    Array.from(container.querySelectorAll("select.character-select")).map((select) => select.value);

  const getCharacterDropdownValues = (container) =>
    getCharacterDropdownSelections(container).filter(Boolean);

  const updateCharacterDropdownOptions = () => {
    [availabilityCharactersFields, eventCharactersFields].forEach((container) => {
      const selects = container.querySelectorAll("select.character-select");
      const selectedValues = Array.from(selects)
        .map((select) => select.value)
        .filter(Boolean);

      selects.forEach((select) => {
        Array.from(select.options).forEach((option) => {
          if (!option.value) {
            option.disabled = false;
            return;
          }

          option.disabled =
            selectedValues.includes(option.value) && select.value !== option.value;
        });
      });
    });
  };

  const handleCharacterDropdownChange = (event) => {
    const sourceContainer = event.target.closest(".character-dropdowns");
    if (!sourceContainer) {
      return;
    }

    const sourceValues = Array.from(sourceContainer.querySelectorAll("select.character-select")).map(
      (select) => select.value,
    );
    const targetContainer =
      sourceContainer === availabilityCharactersFields
        ? eventCharactersFields
        : availabilityCharactersFields;

    targetContainer.querySelectorAll("select.character-select").forEach((select, index) => {
      select.value = sourceValues[index] || "";
    });

    updateCharacterDropdownOptions();
    saveBookingFormDraft();
  };

  const renderCharacterDropdowns = (container, count, disabled, selectedValues = [], includeName = false) => {
    container.innerHTML = "";

    for (let index = 0; index < count; index += 1) {
      const select = document.createElement("select");
      select.className = "character-select";
      if (includeName) {
        select.name = "characters";
      }
      select.disabled = disabled;
      populateCharacterSelect(select);
      select.value = selectedValues[index] || "";
      select.addEventListener("change", handleCharacterDropdownChange);

      if (count > 1) {
        const row = document.createElement("div");
        row.className = "character-dropdown-row";
        const label = document.createElement("span");
        label.className = "character-dropdown-label";
        label.textContent = `Character ${index + 1}`;
        row.append(label, select);
        container.append(row);
      } else {
        container.append(select);
      }
    }

    updateCharacterDropdownOptions();
  };

  const setCharacterDropdownCount = (count, disabled, selectedValues = []) => {
    renderCharacterDropdowns(availabilityCharactersFields, count, disabled, selectedValues, false);
    renderCharacterDropdowns(eventCharactersFields, count, disabled, selectedValues, true);
  };

  const setOptions = (selectEl, options, defaultLabel) => {
    selectEl.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultLabel;
    selectEl.append(defaultOption);
    options.forEach((option) => {
      const opt = document.createElement("option");
      opt.value = option.value;
      opt.textContent = option.label;
      selectEl.append(opt);
    });
  };

  const getDateFromKey = (dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const isDateUnavailable = (dateObj, dateKey) => {
    if (dateObj < todayStart) return true;
    if (unavailableWeekdays.has(dateObj.getDay())) return true;
    return blackoutDates.has(dateKey);
  };

  const getAvailablePackagesByDate = (dateObj) => {
    const weekday = dateObj.getDay();
    if (weekday === 0 || weekday === 6) return ["starter", "signature", "grand"];
    return ["starter", "signature"];
  };

  const syncAvailabilityToForm = () => {
    if (selectedDateKey) {
      eventDateInput.value = selectedDateKey;
    }

    const packageId = availabilityPackage.value;
    selectedPackageId = packageId;
    eventPackageInput.value = packageId;

    if (packageId) {
      updateTimeOptionsByPackage(packageId);
      const selectedTime = availabilityTime.value;
      if (selectedTime) {
        eventTimeInput.value = selectedTime;
        availabilityTime.value = selectedTime;
      }
      updateCharactersByPackage(
        packageId,
        getCharacterDropdownSelections(availabilityCharactersFields),
      );
    } else {
      updateTimeOptionsByPackage("");
      updateCharactersByPackage("");
    }

    saveBookingFormDraft();
  };

  const updateContinueButton = () => {
    if (!selectedDateKey) {
      availabilityContinueButton.disabled = true;
      return;
    }

    const dateObj = getDateFromKey(selectedDateKey);
    availabilityContinueButton.disabled = isDateUnavailable(dateObj, selectedDateKey);
  };

  const updateCharactersByPackage = (packageId, preferredSelections) => {
    const selectedPackage = packageCatalog[packageId];

    if (!selectedPackage) {
      setCharacterDropdownCount(1, true, []);
      availabilityNote.textContent = "Select a package to unlock character options.";
      if (eventCharactersNote) {
        eventCharactersNote.hidden = false;
        eventCharactersNote.textContent = "Select a package to choose your character(s).";
      }
      return;
    }

    const currentSelections =
      preferredSelections ||
      (getCharacterDropdownSelections(availabilityCharactersFields).some(Boolean)
        ? getCharacterDropdownSelections(availabilityCharactersFields)
        : getCharacterDropdownSelections(eventCharactersFields));
    const trimmedSelections = currentSelections.slice(0, selectedPackage.maxCharacters);
    setCharacterDropdownCount(selectedPackage.maxCharacters, false, trimmedSelections);

    availabilityNote.textContent =
      selectedPackage.maxCharacters > 1
        ? `Choose up to ${selectedPackage.maxCharacters} characters from the dropdowns below.`
        : "This package includes one character selection.";

    if (eventCharactersNote) {
      eventCharactersNote.hidden = false;
      eventCharactersNote.textContent =
        selectedPackage.maxCharacters > 1
          ? `Choose up to ${selectedPackage.maxCharacters} characters from the dropdowns below.`
          : "This package includes one character selection.";
    }
  };

  const updateTimeOptionsByPackage = (packageId) => {
    const selectedPackage = packageCatalog[packageId];
    if (!selectedPackage) {
      setOptions(availabilityTime, [], "Select time");
      setOptions(eventTimeInput, [], "Select time");
      availabilityTime.disabled = true;
      eventTimeInput.disabled = true;
      return;
    }
    const timeOptions = selectedPackage.times.map((time) => ({ value: time, label: time }));
    setOptions(availabilityTime, timeOptions, "Select time");
    setOptions(eventTimeInput, timeOptions, "Select time");
    availabilityTime.disabled = false;
    eventTimeInput.disabled = false;
  };

  setCharacterDropdownCount(1, true, []);
  setOptions(availabilityTime, [], "Select time");
  setOptions(eventTimeInput, [], "Select time");
  bookingFlow.hidden = true;
  availabilityPanel.hidden = true;
  availabilityTime.disabled = true;
  eventTimeInput.disabled = true;

  const openCalendar = () => {
    bookingFlow.hidden = false;
    availabilityPanel.hidden = true;
    availabilityContinueButton.disabled = true;
    renderCalendar();
    calendarSelectionText.textContent = selectedDateKey
      ? calendarSelectionText.textContent
      : "Select a date to continue your booking.";
  };

  const openDetails = () => {
    availabilityPanel.hidden = false;
  };

  const renderCalendar = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendarMonthLabel.textContent = `${monthNames[month]} ${year}`;
    calendarGrid.innerHTML = "";

    for (let i = 0; i < firstDayIndex; i += 1) {
      const emptyCell = document.createElement("span");
      emptyCell.className = "calendar-day is-empty";
      emptyCell.textContent = "";
      calendarGrid.append(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dateObj = new Date(year, month, day);
      const unavailable = isDateUnavailable(dateObj, dateKey);
      const dayButton = document.createElement("button");
      dayButton.type = "button";
      dayButton.className = "calendar-day";
      dayButton.textContent = String(day);
      dayButton.dataset.date = dateKey;

      if (dateKey === todayKey) {
        dayButton.classList.add("is-today");
      }
      if (dateKey === selectedDateKey) {
        dayButton.classList.add("is-selected");
      }
      if (unavailable) {
        dayButton.classList.add("is-unavailable");
        dayButton.disabled = true;
      }

      dayButton.addEventListener("click", () => {
        selectedDateKey = dateKey;
        selectedPackageId = "";
        eventDateInput.value = selectedDateKey;
        saveBookingFormDraft();
        calendarSelectionText.textContent = `Selected date: ${monthNames[month]} ${day}, ${year}`;
        openDetails();

        if (isDateUnavailable(dateObj, dateKey)) {
          availabilityStatus.textContent = "This date is unavailable. Please choose another date.";
          availabilityStatus.className = "availability-status unavailable";
          setOptions(availabilityPackage, [], "No packages available");
          setOptions(eventPackageInput, [], "No packages available");
          selectedPackageId = "";
          updateTimeOptionsByPackage("");
          updateCharactersByPackage("");
          updateContinueButton();
          renderCalendar();
          return;
        }

        const availablePackageIds = getAvailablePackagesByDate(dateObj);
        const packageOptions = availablePackageIds.map((id) => ({
          value: id,
          label: packageCatalog[id].label,
        }));
        availabilityStatus.textContent = "Date is available. Choose a package and time.";
        availabilityStatus.className = "availability-status available";
        setOptions(availabilityPackage, packageOptions, "Select package");
        setOptions(eventPackageInput, packageOptions, "Select package");
        updateTimeOptionsByPackage("");
        updateCharactersByPackage("");
        updateContinueButton();
        renderCalendar();
      });

      calendarGrid.append(dayButton);
    }
  };

  availabilityPackage.addEventListener("change", () => {
    selectedPackageId = availabilityPackage.value;
    eventPackageInput.value = selectedPackageId;
    updateTimeOptionsByPackage(selectedPackageId);
    updateCharactersByPackage(selectedPackageId);
  });

  eventPackageInput.addEventListener("change", () => {
    selectedPackageId = eventPackageInput.value;
    availabilityPackage.value = selectedPackageId;
    updateTimeOptionsByPackage(selectedPackageId);
    updateCharactersByPackage(selectedPackageId);
  });

  availabilityTime.addEventListener("change", () => {
    eventTimeInput.value = availabilityTime.value;
  });

  eventTimeInput.addEventListener("change", () => {
    availabilityTime.value = eventTimeInput.value;
  });

  availabilityTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    openCalendar();
  });

  availabilityContinueButton.addEventListener("click", () => {
    syncAvailabilityToForm();

    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const firstEmptyField = bookingForm?.querySelector(
      'input[required]:not([type="date"]), select[required], textarea[required]'
    );
    if (firstEmptyField && !firstEmptyField.value) {
      firstEmptyField.focus();
    }
  });

  calendarPrevButton.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  calendarNextButton.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  packageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const packageId = button.dataset.package || "";
      if (!packageId) return;
      if (eventPackageInput.querySelector(`option[value="${packageId}"]`)) {
        eventPackageInput.value = packageId;
        availabilityPackage.value = packageId;
        selectedPackageId = packageId;
        updateTimeOptionsByPackage(packageId);
        updateCharactersByPackage(packageId);
        saveBookingFormDraft();
      }
    });
  });

  restoreBookingFormDraft = () => {
    const rawDraft = sessionStorage.getItem(BOOKING_FORM_DRAFT_KEY);
    if (!rawDraft) {
      return;
    }

    let draft;
    try {
      draft = JSON.parse(rawDraft);
    } catch {
      return;
    }

    applySimpleBookingFormDraft(draft);
    syncEventTypeOtherField();

    if (draft["event-date"]) {
      selectedDateKey = draft["event-date"];
      eventDateInput.value = draft["event-date"];
    }

    const packageId = draft["event-package"];
    if (packageId && eventPackageInput.querySelector(`option[value="${packageId}"]`)) {
      eventPackageInput.value = packageId;
      selectedPackageId = packageId;

      if (!availabilityPackage.querySelector(`option[value="${packageId}"]`)) {
        setOptions(
          availabilityPackage,
          Object.entries(packageCatalog).map(([id, pkg]) => ({
            value: id,
            label: pkg.label,
          })),
          "Select package",
        );
      }

      availabilityPackage.value = packageId;
      updateTimeOptionsByPackage(packageId);

      if (draft["event-time"]) {
        eventTimeInput.value = draft["event-time"];
        availabilityTime.value = draft["event-time"];
      }

      updateCharactersByPackage(packageId);

      if (draft.characters?.length) {
        setCharacterDropdownCount(
          packageCatalog[packageId].maxCharacters,
          false,
          draft.characters,
        );
      }
    }
  };

  serviceLocationChangeHandlers.push(() => {
    const allowedValues = new Set(getCharacterCatalog().map((character) => character.value));
    const currentSelections = getCharacterDropdownSelections(eventCharactersFields).map((value) =>
      allowedValues.has(value) ? value : "",
    );
    updateCharactersByPackage(selectedPackageId, currentSelections);
  });
}

if (bookingForm) {
  let draftSaveTimer = 0;

  const inquiryFieldsFromEvent = (eventType) => {
    const fields = inquiryFieldsFromPairs(INQUIRY_DETAIL_FIELDS[eventType] || []);
    if (eventType === "dance") {
      const styles = checkedInquiryLabels('#section-dance input[name="dance-style"]');
      const typeIndex = fields.findIndex((field) => field.label === "Type of Engagement");
      fields.splice(typeIndex + 1, 0, {
        label: "Dance Style",
        value: styles.join(", ") || "Not provided",
      });
    }
    return fields;
  };

  const selectedInquiryCharacters = (eventType) => {
    if (INQUIRY_NO_PACKAGE.includes(eventType)) {
      return [];
    }
    if (eventType === "corporate") {
      return checkedInquiryLabels('#corp-char-grid input[name="corp-char"]');
    }
    return ["char1", "char2", "char3"].map((id) => readInquiryValue(id)).filter(Boolean);
  };

  const buildInquirySections = (eventType) => {
    const locationId = serviceLocationInput?.value || "";
    const sections = [
      {
        title: "Your Information",
        fields: [
          { label: "Name", value: displayInquiryValue(readInquiryValue("name")) },
          { label: "Email", value: displayInquiryValue(readInquiryValue("email")) },
          { label: "Phone Number", value: displayInquiryValue(readInquiryValue("phone")) },
          { label: "Preferred Contact Method", value: displayInquiryValue(readInquiryValue("contact-pref")) },
          { label: "How did you hear about us?", value: displayInquiryValue(readInquiryValue("referral")) },
          {
            label: "Service Location",
            value: displayInquiryValue(SERVICE_LOCATIONS[locationId]?.label || locationId),
          },
        ],
      },
      {
        title: "Event Type",
        fields: [{ label: "Event Type", value: INQUIRY_EVENT_LABELS[eventType] || eventType || "Not provided" }],
      },
      {
        title: INQUIRY_DETAIL_TITLES[eventType] || "Event Details",
        fields: inquiryFieldsFromEvent(eventType),
      },
    ];

    if (!INQUIRY_NO_PACKAGE.includes(eventType)) {
      if (eventType === "corporate") {
        const characters = selectedInquiryCharacters(eventType);
        sections.push({
          title: "Package & Characters",
          fields: [
            { label: "Preferred Package", value: displayInquiryValue(readInquiryValue("corp-package")) },
            { label: "DREAM Characters", value: characters.join(", ") || "Not provided" },
            {
              label: "Performer appearance preference",
              value: displayInquiryValue(readInquiryValue("corp-appearance")),
            },
          ],
        });
      } else {
        sections.push({
          title: "Package & Characters",
          fields: [
            { label: "Preferred Package", value: displayInquiryValue(readInquiryValue("package")) },
            { label: "Character 1", value: displayInquiryValue(readInquiryValue("char1")) },
            { label: "Character 2", value: displayInquiryValue(readInquiryValue("char2")) },
            { label: "Character 3", value: displayInquiryValue(readInquiryValue("char3")) },
            { label: "Performer appearance preference", value: displayInquiryValue(readInquiryValue("appearance")) },
          ],
        });
      }
    }

    sections.push({
      title: "A Little More",
      fields: [
        { label: "Referral or Discount Code", value: displayInquiryValue(readInquiryValue("referral-code")) },
        { label: "Additional Notes", value: displayInquiryValue(readInquiryValue("notes")) },
      ],
    });

    return sections;
  };

  const validateInquiry = (eventType) => {
    if (!readInquiryValue("name")) {
      alert("Please enter your name.");
      document.getElementById("name")?.focus();
      return false;
    }
    if (!readInquiryValue("email")) {
      alert("Please enter your email address.");
      document.getElementById("email")?.focus();
      return false;
    }
    if (!readInquiryValue("phone")) {
      alert("Please enter your phone number.");
      document.getElementById("phone")?.focus();
      return false;
    }
    if (!readInquiryValue("referral")) {
      alert("Please tell us how you heard about us.");
      document.getElementById("referral")?.focus();
      return false;
    }
    if (!eventType) {
      alert("Please select an event type.");
      return false;
    }

    const locationField = document.getElementById(INQUIRY_LOCATION_FIELDS[eventType] || "");
    if (locationField && !String(locationField.value || "").trim()) {
      alert(
        locationField.tagName === "SELECT"
          ? "Please select the event location."
          : "Please enter the event location.",
      );
      locationField.focus();
      return false;
    }

    if (!INQUIRY_NO_PACKAGE.includes(eventType)) {
      if (eventType === "corporate") {
        const corpChars = document.querySelectorAll('#corp-char-grid input[name="corp-char"]:checked');
        if (corpChars.length === 0) {
          alert("Please select at least one character.");
          return false;
        }
        if (!readInquiryValue("corp-package")) {
          alert("Please select a package.");
          document.getElementById("corp-package")?.focus();
          return false;
        }
      } else if (!readInquiryValue("char1")) {
        alert("Please select at least one character.");
        document.getElementById("char1")?.focus();
        return false;
      } else if (!readInquiryValue("package")) {
        alert("Please select a package.");
        document.getElementById("package")?.focus();
        return false;
      }
    }

    return true;
  };

  const resetInquiryForm = () => {
    const locationId = document.documentElement.dataset.serviceLocation || serviceLocationInput?.value || "";
    bookingForm.reset();
    if (serviceLocationInput && locationId) {
      serviceLocationInput.value = locationId;
    }
    const eventTypeValue = document.getElementById("event-type-value");
    if (eventTypeValue) {
      eventTypeValue.value = "";
    }
    document.querySelectorAll(".booking-form .event-btn").forEach((button) => {
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", "false");
    });
    INQUIRY_EVENT_TYPES.forEach((eventName) => {
      document.getElementById(`section-${eventName}`)?.classList.add("inquiry-hidden");
    });
    ["details-section", "section-package", "section-corp-chars", "section-additional"].forEach((id) => {
      document.getElementById(id)?.classList.add("inquiry-hidden");
    });
    syncInquiryCharacters();
  };

  document.querySelectorAll(".booking-form .event-btn").forEach((button) => {
    button.addEventListener("click", () => {
      showInquiryEventType(button.dataset.type);
      saveBookingFormDraft();
    });
  });

  bookingForm.addEventListener("input", () => {
    window.clearTimeout(draftSaveTimer);
    draftSaveTimer = window.setTimeout(saveBookingFormDraft, 200);
  });

  bookingForm.addEventListener("change", saveBookingFormDraft);
  window.addEventListener("pagehide", saveBookingFormDraft);

  initBookingFormDraftOnLoad();

  const submitBookingInquiry = async () => {
    const eventType = readInquiryValue("event-type-value");
    if (!validateInquiry(eventType)) {
      return;
    }

    const submitButton = bookingForm.querySelector("#booking-submit");
    const defaultButtonText = submitButton?.textContent || "Submit Booking Request";
    if (submitButton) {
      submitButton.textContent = "Sending...";
      submitButton.setAttribute("disabled", "true");
    }

    const locationId = serviceLocationInput?.value || "";
    const characters = selectedInquiryCharacters(eventType);
    const eventPackage =
      eventType === "corporate"
        ? readInquiryValue("corp-package")
        : INQUIRY_NO_PACKAGE.includes(eventType)
          ? ""
          : readInquiryValue("package");
    const payload = {
      name: readInquiryValue("name"),
      email: readInquiryValue("email"),
      phone: readInquiryValue("phone"),
      eventDate: readInquiryValue(INQUIRY_DATE_FIELDS[eventType] || ""),
      eventPackage,
      eventTime: readInquiryValue(INQUIRY_TIME_FIELDS[eventType] || ""),
      eventType: INQUIRY_EVENT_LABELS[eventType] || eventType,
      serviceLocation: SERVICE_LOCATIONS[locationId]?.label || locationId,
      characters,
      message: readInquiryValue("notes"),
      sections: buildInquirySections(eventType),
    };

    try {
      const response = await fetch(BOOKING_INBOX_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Booking inquiry submission failed");
      }

      resetInquiryForm();
      clearBookingFormDraft();
      if (submitButton) {
        submitButton.textContent = "Inquiry Sent";
      }

      alert(
        `Thank you, ${payload.name}! Your inquiry has been received. A member of the D&J DREAM team will be in touch within 24-48 hours.\n\nDREAMing is for everyone.`,
      );

      window.setTimeout(() => {
        if (submitButton) {
          submitButton.textContent = defaultButtonText;
          submitButton.removeAttribute("disabled");
        }
      }, 2500);
    } catch (error) {
      if (submitButton) {
        submitButton.textContent = defaultButtonText;
        submitButton.removeAttribute("disabled");
      }

      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong sending your inquiry.";

      alert(`${errorMessage} Please email dandjdream@gmail.com or call (845) 645-1534.`);
    }
  };

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitBookingInquiry();
  });

  bookingForm.querySelector("#booking-submit")?.addEventListener("click", submitBookingInquiry);
}

if (packageButtons.length > 0) {
  const confettiLayer = document.createElement("div");
  confettiLayer.className = "confetti-layer";
  document.body.append(confettiLayer);

  const confettiColors = ["#ff5aa9", "#7f64ff", "#5ec8ff", "#f8d27a", "#ffffff"];

  const launchConfetti = () => {
    const pieceCount = 130;
    const startY = siteHeader ? Math.max(0, siteHeader.getBoundingClientRect().bottom - 8) : 0;
    const fallDistance = Math.max(600, window.innerHeight - startY + 120);

    confettiLayer.innerHTML = "";

    for (let i = 0; i < pieceCount; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * window.innerWidth}px`;
      piece.style.top = `${startY}px`;
      piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      piece.style.setProperty("--drift-x", `${(Math.random() - 0.5) * 320}px`);
      piece.style.setProperty("--rotate-end", `${(Math.random() - 0.5) * 880}deg`);
      piece.style.setProperty("--fall-distance", `${fallDistance}px`);
      piece.style.setProperty("--fall-duration", `${1300 + Math.random() * 900}ms`);
      piece.style.animationDelay = `${Math.random() * 120}ms`;

      if (Math.random() > 0.55) {
        piece.style.width = "8px";
        piece.style.height = "8px";
        piece.style.borderRadius = "999px";
      }

      piece.addEventListener("animationend", () => {
        piece.remove();
      });

      confettiLayer.append(piece);
    }
  };

  packageButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      launchConfetti();

      const bookingSection = document.querySelector("#booking");
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

if (heroCarousel && heroCarouselTrack) {
  const CAROUSEL_INDEX_KEY = "djdream-carousel-index";
  const BASE_HERO_IMAGES = [
    "./assets/party-01.png",
    "./assets/party-02.png",
    "./assets/party-03.png",
    "./assets/party-04.png",
    "./assets/party-05.png",
    "./assets/party-06.png",
    "./assets/party-07.png",
    "./assets/party-08.png",
    "./assets/party-09.png",
    "./assets/party-10.png",
    "./assets/party-11.png",
    "./assets/party-12.png",
    "./assets/party-13.png",
    "./assets/party-14.png",
    "./assets/party-15.png",
  ];
  const BALTIMORE_HERO_IMAGES = [
    "./assets/baltimore-azure-party.png",
    "./assets/baltimore-goggle-party.png",
  ];

  const interleaveHeroImages = (baseImages, extraImages) => {
    const mixed = [...baseImages];
    extraImages.forEach((src, index) => {
      const slot = Math.min((index + 1) * 3 - 1 + index, mixed.length);
      mixed.splice(slot, 0, src);
    });
    return mixed;
  };

  const getHeroImagesForLocation = (locationId) =>
    locationId === "baltimore"
      ? interleaveHeroImages(BASE_HERO_IMAGES, BALTIMORE_HERO_IMAGES)
      : [...BASE_HERO_IMAGES];

  let heroImages = getHeroImagesForLocation(document.documentElement.dataset.serviceLocation);
  let currentCarouselLocation = document.documentElement.dataset.serviceLocation || "";

  const carouselSets = 3;
  let slideWidth = 0;
  let activeCarouselIndex = 0;
  let isRepositioning = false;
  let isInitializing = true;
  let isAutoAdvancing = false;
  let scrollStopTimer = 0;
  let autoPlayTimer = 0;
  let autoPlayResumeTimer = 0;
  let lastScrollLeft = 0;
  let carouselRebuildToken = 0;
  const AUTO_PLAY_INTERVAL = 2800;
  const AUTO_PLAY_RESUME_DELAY = 6000;

  const getSavedCarouselIndex = () => {
    const saved = sessionStorage.getItem(CAROUSEL_INDEX_KEY);
    if (saved === null) {
      return 0;
    }

    const index = Number(saved);
    if (!Number.isFinite(index) || index < 0 || index >= heroImages.length) {
      return 0;
    }

    return index;
  };

  let startCarouselIndex = getSavedCarouselIndex();

  const buildCarouselSlides = () => {
    heroCarouselTrack.innerHTML = "";

    for (let setIndex = 0; setIndex < carouselSets; setIndex += 1) {
      heroImages.forEach((src, imageIndex) => {
        const slide = document.createElement("div");
        slide.className = "hero-carousel-slide";
        slide.dataset.index = String(imageIndex);

        const image = document.createElement("img");
        image.src = src;
        image.alt = `Themed birthday party scene ${imageIndex + 1}`;
        image.loading = setIndex === 1 && imageIndex < 2 ? "eager" : "lazy";
        image.decoding = "async";
        slide.append(image);
        heroCarouselTrack.append(slide);
      });
    }
  };

  buildCarouselSlides();

  const getSlideWidth = () => {
    const slide = heroCarouselTrack.querySelector(".hero-carousel-slide");
    return slide ? slide.offsetWidth : heroCarouselTrack.clientWidth;
  };

  const getLogicalIndex = () => {
    slideWidth = getSlideWidth();
    if (!slideWidth) {
      return 0;
    }

    const rawIndex = Math.round(heroCarouselTrack.scrollLeft / slideWidth);
    return ((rawIndex % heroImages.length) + heroImages.length) % heroImages.length;
  };

  const syncCarouselIndex = (index = getLogicalIndex()) => {
    activeCarouselIndex = index;
    sessionStorage.setItem(CAROUSEL_INDEX_KEY, String(index));
  };

  const scrollToCarouselIndex = (index, behavior = "smooth") => {
    slideWidth = getSlideWidth();
    if (!slideWidth) {
      return;
    }

    const middleSetOffset = heroImages.length * slideWidth;
    heroCarouselTrack.scrollTo({
      left: middleSetOffset + index * slideWidth,
      behavior,
    });
    syncCarouselIndex(index);
  };

  const repositionIfNeeded = () => {
    if (isRepositioning) {
      return;
    }

    slideWidth = getSlideWidth();
    if (!slideWidth) {
      return;
    }

    const slideCount = heroImages.length;
    const rawIndex = Math.round(heroCarouselTrack.scrollLeft / slideWidth);
    let offset = 0;

    if (rawIndex < slideCount) {
      offset = slideCount * slideWidth;
    } else if (rawIndex >= slideCount * 2) {
      offset = -slideCount * slideWidth;
    }

    if (offset === 0) {
      syncCarouselIndex();
      return;
    }

    isRepositioning = true;
    const previousBehavior = heroCarouselTrack.style.scrollBehavior;
    heroCarouselTrack.style.scrollBehavior = "auto";
    heroCarouselTrack.scrollLeft += offset;
    heroCarouselTrack.style.scrollBehavior = previousBehavior;
    isRepositioning = false;
    syncCarouselIndex();
  };

  const setCarouselScrollLeft = (left) => {
    const previousBehavior = heroCarouselTrack.style.scrollBehavior;
    const previousSnap = heroCarouselTrack.style.scrollSnapType;
    heroCarouselTrack.style.scrollBehavior = "auto";
    heroCarouselTrack.style.scrollSnapType = "none";
    heroCarouselTrack.scrollLeft = left;
    heroCarouselTrack.style.scrollBehavior = previousBehavior;
    heroCarouselTrack.style.scrollSnapType = previousSnap;
    lastScrollLeft = left;
  };

  const initCarouselPosition = () => {
    slideWidth = getSlideWidth();
    if (!slideWidth) {
      return false;
    }

    isRepositioning = true;
    setCarouselScrollLeft(heroImages.length * slideWidth + startCarouselIndex * slideWidth);
    isRepositioning = false;
    syncCarouselIndex(startCarouselIndex);
    return true;
  };

  const clearAutoPlay = () => {
    window.clearInterval(autoPlayTimer);
    autoPlayTimer = 0;
  };

  const stopCarouselActivity = () => {
    clearAutoPlay();
    window.clearTimeout(autoPlayResumeTimer);
    autoPlayResumeTimer = 0;
    window.clearTimeout(scrollStopTimer);
    scrollStopTimer = 0;
    isAutoAdvancing = false;
    // Interrupt any in-flight smooth scroll before rebuild.
    setCarouselScrollLeft(heroCarouselTrack.scrollLeft);
  };

  const revealCarousel = () => {
    heroCarousel.classList.add("is-ready");
    isInitializing = false;
    startAutoPlay();
  };

  const settleCarouselAfterRebuild = (rebuildToken) => {
    const tryReveal = () => {
      if (rebuildToken !== carouselRebuildToken) {
        return true;
      }

      if (!initCarouselPosition()) {
        return false;
      }

      revealCarousel();
      return true;
    };

    // Layout after DOM rebuild can lag one frame; confirm position twice.
    window.requestAnimationFrame(() => {
      if (rebuildToken !== carouselRebuildToken) {
        return;
      }

      initCarouselPosition();
      window.requestAnimationFrame(() => {
        if (!tryReveal()) {
          window.addEventListener(
            "load",
            () => {
              tryReveal();
            },
            { once: true },
          );
        }
      });
    });
  };

  const advanceCarousel = () => {
    if (isInitializing || isRepositioning || document.hidden) {
      return;
    }

    slideWidth = getSlideWidth();
    if (!slideWidth) {
      return;
    }

    isAutoAdvancing = true;
    heroCarouselTrack.scrollTo({
      left: heroCarouselTrack.scrollLeft + slideWidth,
      behavior: "smooth",
    });
  };

  const startAutoPlay = () => {
    clearAutoPlay();
    autoPlayTimer = window.setInterval(advanceCarousel, AUTO_PLAY_INTERVAL);
  };

  const pauseAutoPlay = () => {
    clearAutoPlay();
    window.clearTimeout(autoPlayResumeTimer);
    autoPlayResumeTimer = window.setTimeout(startAutoPlay, AUTO_PLAY_RESUME_DELAY);
  };

  const handleScrollSettled = () => {
    if (isInitializing) {
      return;
    }

    isAutoAdvancing = false;
    repositionIfNeeded();
  };

  heroCarouselTrack.addEventListener(
    "scroll",
    () => {
      if (isInitializing) {
        return;
      }

      if (!isRepositioning) {
        window.requestAnimationFrame(syncCarouselIndex);
      }

      const currentScrollLeft = heroCarouselTrack.scrollLeft;
      if (currentScrollLeft === lastScrollLeft) {
        return;
      }

      if (!isAutoAdvancing) {
        pauseAutoPlay();
      }

      lastScrollLeft = currentScrollLeft;
      window.clearTimeout(scrollStopTimer);
      scrollStopTimer = window.setTimeout(handleScrollSettled, 150);
    },
    { passive: true },
  );

  heroCarouselTrack.addEventListener("scrollend", handleScrollSettled);

  heroCarousel.addEventListener("pointerdown", pauseAutoPlay, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearAutoPlay();
      return;
    }

    if (heroCarousel.classList.contains("is-ready")) {
      startAutoPlay();
    }
  });

  window.addEventListener("resize", () => {
    scrollToCarouselIndex(activeCarouselIndex, "auto");
  });

  if (initCarouselPosition()) {
    revealCarousel();
  } else {
    window.addEventListener(
      "load",
      () => {
        if (initCarouselPosition()) {
          revealCarousel();
        }
      },
      { once: true },
    );
  }

  serviceLocationChangeHandlers.push((locationId) => {
    if (locationId === currentCarouselLocation) {
      return;
    }

    currentCarouselLocation = locationId;
    heroImages = getHeroImagesForLocation(locationId);
    const rebuildToken = ++carouselRebuildToken;

    stopCarouselActivity();
    isInitializing = true;
    heroCarousel.classList.remove("is-ready");
    startCarouselIndex = 0;
    activeCarouselIndex = 0;
    sessionStorage.setItem(CAROUSEL_INDEX_KEY, "0");
    buildCarouselSlides();
    // Sync position immediately when possible, then settle after layout.
    initCarouselPosition();
    settleCarouselAfterRebuild(rebuildToken);
  });
}
