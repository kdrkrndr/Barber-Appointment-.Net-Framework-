
// Define functions globally
function updatePrice(hizmetId) {

    if (typeof $ === 'undefined') {
        console.error("jQuery is not loaded!");
        return;
    }

    if (hizmetId === "0") {
        var lblTutar = document.getElementById(lblTutarClientId);
        if (lblTutar) {
            lblTutar.innerHTML = "-";
        }
        return;
    }

    // Make AJAX call to get price
    $.ajax({
        type: "POST",
        url: "../service/BerberService.asmx/GetHizmetPrice",
        data: JSON.stringify({ hizmetId: hizmetId }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            var lblTutar = document.getElementById(lblTutarClientId);
            if (lblTutar) {
                var price = response.d || "0";
                
                if (price === "0" || price === "") {
                    lblTutar.innerHTML = "-";
                } else {
                    lblTutar.innerHTML = price + " TL";
                }
            } else {
                console.error("Price label not found");
            }
        },
        error: function (xhr, status, error) {
            console.error("Error getting price:", error);
            console.error("Status:", status);
            console.error("Response:", xhr.responseText);
            
            var lblTutar = document.getElementById(lblTutarClientId);
            if (lblTutar) {
                lblTutar.innerHTML = "Hata";
            }
        }
    });
}

function updateSummary() {
    var combo = $find(rcbHizmetClientId);
    if (combo) {
        var selectedItem = combo.get_selectedItem();
        if (selectedItem) {
            var hizmetId = selectedItem.get_value();
            var hizmetText = selectedItem.get_text();
            
            
            // Update service name
            var lblHizmet = document.getElementById(lblHizmetClientId);
            if (lblHizmet) {
                lblHizmet.innerHTML = hizmetText;
            }
            
            // Update price
            updatePrice(hizmetId);
        } else {
        }
    } else {
        console.error("ComboBox not found");
    }
}

// Initialize when document is ready
$(document).ready(function() {

    // Make updatePrice available globally
    window.updatePrice = updatePrice;

    // Make updateSummary available globally
    window.updateSummary = updateSummary;

/*     // Select first date pill on page load
    var firstPill = document.querySelector('.date-pill');
    if (firstPill) {
        firstPill.classList.add('active');
        
        // Select first available time slot
        setTimeout(function() {
            var firstAvailableSlot = document.querySelector('.time-slot.available');
            if (firstAvailableSlot) {
                selectTime(firstAvailableSlot);
            }
        }, 500); // Small delay to ensure time slots are loaded
    } */
});

function selectDate(element) {
    // Remove active class from all pills
    var pills = document.querySelectorAll('.date-pill');
    pills.forEach(pill => pill.classList.remove('active'));
    
    // Add active class to selected pill
    element.classList.add('active');
    
    // Get selected date
    var day = element.querySelector('.day').innerText;
    var month = element.querySelector('.mon').innerText;
    var year = new Date().getFullYear();
    var monthNumber = getMonthNumber(month);
    
    // Ensure day is two digits
    day = day.padStart(2, '0');
    
    // Update hidden field with selected date
    var hdnDate = document.getElementById(hdnSelectedDateClientId);
    if (hdnDate) {
        hdnDate.value = year + '-' + monthNumber + '-' + day;
        
        // Update summary
        var lblTarih = document.getElementById(lblTarihClientId);
        if (lblTarih) {
            lblTarih.innerHTML = day + ' ' + month + ' ' + year;
        }
        
        // Trigger postback to update time slots
        __doPostBack(hdnSelectedDateClientId, '');
    }
    
    checkEnableAppointmentButton();
}

function getMonthNumber(monthAbbr) {
    const months = {
        'Oca': '01', 'Şub': '02', 'Mar': '03', 'Nis': '04',
        'May': '05', 'Haz': '06', 'Tem': '07', 'Ağu': '08',
        'Eyl': '09', 'Eki': '10', 'Kas': '11', 'Ara': '12'
    };
    return months[monthAbbr] || '01';
}

function selectTime(element) {
    if (!element || element.classList.contains('booked')) return;
    
    
    // Remove active class from all time slots
    var slots = document.querySelectorAll('.time-slot');
    slots.forEach(slot => slot.classList.remove('active'));
    
    // Add active class to selected slot
    element.classList.add('active');
    
    // Update hidden field with selected time ID
    var hdnTime = document.getElementById(hdnSelectedTimeIdClientId);
    if (hdnTime) {
        var timeId = element.getAttribute('data-time-id');
        hdnTime.value = timeId;
        
        // Update summary
        var lblSaat = document.getElementById(lblSaatClientId);
        if (lblSaat) {
            lblSaat.innerHTML = element.innerText;
        }
    } else {
        console.error("Hidden time field not found");
    }
    
    checkEnableAppointmentButton();
}

function checkEnableAppointmentButton() {
    const hizmet = document.getElementById(lblHizmetClientId).innerText;
    const tarih = document.getElementById(lblTarihClientId).innerText;
    const saat = document.getElementById(lblSaatClientId).innerText;
    const phone = document.getElementById(txtMusteriTelefonClientId).value;
    const name = document.getElementById(txtMusteriAdClientId).value;
    
    const shouldEnable = hizmet && 
                       tarih && 
                       saat !== '-' && 
                       phone && 
                       name;
    
    // Get the RadButton instance
    var btn = $find(btnRandevuAlClientId);
    if (btn) {
        btn.set_enabled(shouldEnable);
        // Also update the visual state
        var btnElement = document.getElementById(btnRandevuAlClientId);
        if (btnElement) {
            if (shouldEnable) {
                $(btnElement).removeClass('disabled');
            } else {
                $(btnElement).addClass('disabled');
            }
        }
    } else {
        console.error("RadButton instance not found");
    }
}

// Add event listeners for form inputs
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', checkEnableAppointmentButton);
    });
});

// Add styles when document is ready
document.addEventListener('DOMContentLoaded', function() {
    var style = document.createElement('style');
    style.innerHTML = `
        .time-slot.selected {
            background: var(--brand-pink) !important;
            color: white !important;
        }
        .time-slot:not(.booked):hover {
            opacity: 0.8;
            transform: scale(1.02);
        }
        .date-pill:hover {
            background: var(--gray-100);
        }
    `;
    document.head.appendChild(style);
});

function confirmAppointment(sender, args) {
    const hizmet = document.getElementById(lblHizmetClientId).innerText;
    const tarih = document.getElementById(lblTarihClientId).innerText;
    const saat = document.getElementById(lblSaatClientId).innerText;
    
    const message = `Aşağıdaki randevuyu onaylıyor musunuz?\n\n` +
                   `Hizmet: ${hizmet}\n` +
                   `Tarih: ${tarih}\n` +
                   `Saat: ${saat}`;
    
    args.set_cancel(!confirm(message));
} 