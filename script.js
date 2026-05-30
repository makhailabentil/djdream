const SCROLL_POSITION_KEY = "djdream-scroll-y";
const BOOKING_FORM_DRAFT_KEY = "djdream-booking-draft";
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

const menuButton = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const yearSpan = document.querySelector("#year");
const bookingForm = document.querySelector(".booking-form");
const heroCarousel = document.querySelector("#hero-carousel");
const heroCarouselTrack = document.querySelector("#hero-carousel-track");
const eventDateInput = document.querySelector("#event-date");
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
const availabilityCharacters = document.querySelector("#availability-characters");
const availabilityNote = document.querySelector("#availability-note");
const availabilityContinueButton = document.querySelector("#availability-continue");
const bookingSection = document.querySelector("#booking");
const eventPackageInput = document.querySelector("#event-package");
const eventTimeInput = document.querySelector("#event-time");
const eventCharactersInput = document.querySelector("#event-characters");
const packageButtons = document.querySelectorAll(".pricing-grid .price-card .btn");
const siteHeader = document.querySelector(".site-header");
const brandLinks = document.querySelectorAll(".brand, .hero-brand");

const getBookingFormDraft = () => {
  if (!bookingForm) {
    return null;
  }

  const charactersField = bookingForm.elements.namedItem("characters");
  const characters =
    charactersField instanceof HTMLSelectElement
      ? Array.from(charactersField.selectedOptions).map((option) => option.value)
      : [];

  return {
    name: bookingForm.elements.namedItem("name")?.value || "",
    email: bookingForm.elements.namedItem("email")?.value || "",
    phone: bookingForm.elements.namedItem("phone")?.value || "",
    "event-date": bookingForm.elements.namedItem("event-date")?.value || "",
    "event-package": bookingForm.elements.namedItem("event-package")?.value || "",
    "event-time": bookingForm.elements.namedItem("event-time")?.value || "",
    "event-type": bookingForm.elements.namedItem("event-type")?.value || "",
    characters,
    message: bookingForm.elements.namedItem("message")?.value || "",
  };
};

const saveBookingFormDraft = () => {
  if (!bookingForm) {
    return;
  }

  const draft = getBookingFormDraft();
  const hasContent =
    draft.name ||
    draft.email ||
    draft.phone ||
    draft["event-date"] ||
    draft["event-package"] ||
    draft["event-time"] ||
    draft["event-type"] ||
    draft.characters.length > 0 ||
    draft.message;

  if (hasContent) {
    sessionStorage.setItem(BOOKING_FORM_DRAFT_KEY, JSON.stringify(draft));
    return;
  }

  sessionStorage.removeItem(BOOKING_FORM_DRAFT_KEY);
};

const clearBookingFormDraft = () => {
  sessionStorage.removeItem(BOOKING_FORM_DRAFT_KEY);
};

const applySimpleBookingFormDraft = (draft) => {
  if (!bookingForm) {
    return;
  }

  ["name", "email", "phone", "event-date", "event-type", "message"].forEach((fieldName) => {
    const field = bookingForm.elements.namedItem(fieldName);
    if (field && draft[fieldName]) {
      field.value = draft[fieldName];
    }
  });
};

let restoreBookingFormDraft = null;

brandLinks.forEach((brandLink) => {
  brandLink.addEventListener("click", (event) => {
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
  availabilityCharacters &&
  availabilityNote &&
  availabilityContinueButton &&
  eventDateInput &&
  eventPackageInput &&
  eventTimeInput &&
  eventCharactersInput
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

  const characterCatalog = [
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

  const setCharacterOptions = (selectEl) => {
    selectEl.innerHTML = "";
    characterCatalog.forEach((character) => {
      const opt = document.createElement("option");
      opt.value = character.value;
      opt.textContent = character.label;
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

  const applyCharacterSelectionLimit = (selectEl, maxAllowed) => {
    const selected = Array.from(selectEl.selectedOptions);
    if (selected.length <= maxAllowed) return;
    selected.slice(maxAllowed).forEach((option) => {
      option.selected = false;
    });
  };

  const syncCharacterSelections = (sourceSelect, targetSelect) => {
    const selectedValues = new Set(Array.from(sourceSelect.selectedOptions).map((option) => option.value));
    Array.from(targetSelect.options).forEach((option) => {
      option.selected = selectedValues.has(option.value);
    });
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
      updateCharactersByPackage(packageId);
      syncCharacterSelections(availabilityCharacters, eventCharactersInput);
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

  const updateCharactersByPackage = (packageId) => {
    const selectedPackage = packageCatalog[packageId];
    if (!selectedPackage) {
      availabilityCharacters.disabled = true;
      eventCharactersInput.disabled = true;
      availabilityNote.textContent = "Select a package to unlock character options.";
      return;
    }

    availabilityCharacters.disabled = false;
    eventCharactersInput.disabled = false;
    applyCharacterSelectionLimit(availabilityCharacters, selectedPackage.maxCharacters);
    applyCharacterSelectionLimit(eventCharactersInput, selectedPackage.maxCharacters);
    syncCharacterSelections(availabilityCharacters, eventCharactersInput);
    availabilityNote.textContent =
      selectedPackage.maxCharacters > 1
        ? `This package allows up to ${selectedPackage.maxCharacters} characters.`
        : "This package includes one character selection.";
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

  setCharacterOptions(availabilityCharacters);
  setCharacterOptions(eventCharactersInput);
  setOptions(availabilityTime, [], "Select time");
  setOptions(eventTimeInput, [], "Select time");
  bookingFlow.hidden = true;
  availabilityPanel.hidden = true;
  availabilityCharacters.disabled = true;
  eventCharactersInput.disabled = true;
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

  availabilityCharacters.addEventListener("change", () => {
    const maxCharacters = packageCatalog[selectedPackageId]?.maxCharacters || 1;
    applyCharacterSelectionLimit(availabilityCharacters, maxCharacters);
    syncCharacterSelections(availabilityCharacters, eventCharactersInput);
  });

  eventCharactersInput.addEventListener("change", () => {
    const maxCharacters = packageCatalog[selectedPackageId]?.maxCharacters || 1;
    applyCharacterSelectionLimit(eventCharactersInput, maxCharacters);
    syncCharacterSelections(eventCharactersInput, availabilityCharacters);
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
        Array.from(eventCharactersInput.options).forEach((option) => {
          option.selected = draft.characters.includes(option.value);
        });
        applyCharacterSelectionLimit(
          eventCharactersInput,
          packageCatalog[packageId].maxCharacters,
        );
        syncCharacterSelections(eventCharactersInput, availabilityCharacters);
      }
    }
  };

  restoreBookingFormDraft();
}

if (bookingForm) {
  let draftSaveTimer = 0;

  bookingForm.addEventListener("input", () => {
    window.clearTimeout(draftSaveTimer);
    draftSaveTimer = window.setTimeout(saveBookingFormDraft, 200);
  });

  bookingForm.addEventListener("change", saveBookingFormDraft);
  window.addEventListener("pagehide", saveBookingFormDraft);

  if (!restoreBookingFormDraft) {
    const rawDraft = sessionStorage.getItem(BOOKING_FORM_DRAFT_KEY);
    if (rawDraft) {
      try {
        applySimpleBookingFormDraft(JSON.parse(rawDraft));
      } catch {
        sessionStorage.removeItem(BOOKING_FORM_DRAFT_KEY);
      }
    }
  }

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = bookingForm.querySelector('button[type="submit"]');
    const defaultButtonText = submitButton?.textContent || "Send Inquiry";

    if (submitButton) {
      submitButton.textContent = "Sending...";
      submitButton.setAttribute("disabled", "true");
    }

    const formData = new FormData(bookingForm);
    const selectedCharacters = formData.getAll("characters");
    formData.delete("characters");
    formData.append("characters", selectedCharacters.join(", ") || "None selected");

    try {
      const response = await fetch("https://formsubmit.co/ajax/dandjdream@gmail.com", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Booking inquiry submission failed");
      }

      bookingForm.reset();
      clearBookingFormDraft();
      if (submitButton) {
        submitButton.textContent = "Inquiry Sent";
      }

      alert("Thanks! Your inquiry has been received. We will reach out within 24-48 hours.");

      window.setTimeout(() => {
        if (submitButton) {
          submitButton.textContent = defaultButtonText;
          submitButton.removeAttribute("disabled");
        }
      }, 2500);
    } catch {
      if (submitButton) {
        submitButton.textContent = defaultButtonText;
        submitButton.removeAttribute("disabled");
      }

      alert("Something went wrong sending your inquiry. Please email dandjdream@gmail.com or call (845) 645-1534.");
    }
  });
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
  const heroImages = [
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
    heroCarouselTrack.style.scrollBehavior = "auto";
    heroCarouselTrack.scrollLeft = left;
    heroCarouselTrack.style.scrollBehavior = previousBehavior;
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

  const revealCarousel = () => {
    heroCarousel.classList.add("is-ready");
    isInitializing = false;
    startAutoPlay();
  };

  const clearAutoPlay = () => {
    window.clearInterval(autoPlayTimer);
    autoPlayTimer = 0;
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
}
