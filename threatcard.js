// Session management functionality
class SessionManager {
    constructor() {
        this.currentSession = null;
        this.allThreats = [];
        this.init();
    }
    
    init() {
        // Initialize session controls
        document.getElementById('createSession').addEventListener('click', () => this.createSession());
        document.getElementById('copySessionLink').addEventListener('click', () => this.copySessionLink());
        document.getElementById('endSession').addEventListener('click', () => this.endSession());
        document.getElementById('addThreatToSession').addEventListener('click', () => this.addThreatToSession());
        
        // Check if we're loading a specific session from URL
        this.checkForSessionInURL();
    }
    
    generateSessionId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    createSession() {
        const sessionName = document.getElementById('sessionNameInput').value || 'Untitled Session';
        const sessionId = this.generateSessionId();
        
        this.currentSession = {
            sessionId: sessionId,
            name: sessionName,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            threats: [],
            settings: {
                allowViewerRequests: false,
                isPublic: true
            }
        };
        
        // Save to localStorage as backup
        this.saveSession();
        
        this.updateSessionUI();
        this.populateAvailableThreats();
        
        // Update URL to include session
        this.updateURL();
    }
    
    saveSession() {
        if (!this.currentSession) return;
        
        // Save to localStorage
        localStorage.setItem(`session_${this.currentSession.sessionId}`, JSON.stringify(this.currentSession));
    }
    
    updateURL() {
        if (!this.currentSession) {
            window.history.pushState({}, '', window.location.pathname);
            return;
        }
        
        // For GitHub Pages compatibility, encode session data in URL
        const sessionData = {
            id: this.currentSession.sessionId,
            name: this.currentSession.name,
            threats: this.currentSession.threats.map(t => t.name)
        };
        
        // Base64 encode the session data
        const encodedSession = btoa(JSON.stringify(sessionData));
        window.history.pushState({}, '', `?session=${encodedSession}`);
    }
    
    updateSessionUI() {
        const sessionStatus = document.getElementById('sessionStatus');
        const sessionActions = document.getElementById('sessionActions');
        const sessionName = document.getElementById('sessionName');
        const sessionThreats = document.getElementById('sessionThreats');
        
        if (this.currentSession) {
            sessionStatus.textContent = 'Active Session:';
            sessionName.textContent = this.currentSession.name;
            sessionActions.style.display = 'block';
            sessionThreats.style.display = 'block';
            this.updateSessionThreatList();
            this.hideNonSessionCards();
        } else {
            sessionStatus.textContent = 'No active session';
            sessionActions.style.display = 'none';
            sessionThreats.style.display = 'none';
            this.showAllCards();
        }
    }
    
    hideNonSessionCards() {
        if (!this.currentSession) return;
        
        const sessionThreatNames = this.currentSession.threats.map(t => t.name);
        const allThreatCards = document.querySelectorAll('.threat:not(#selectedThreat)');
        
        allThreatCards.forEach(card => {
            const nameDiv = card.querySelector('.threatName');
            if (nameDiv) {
                const threatName = nameDiv.innerHTML;
                if (sessionThreatNames.includes(threatName)) {
                    card.style.display = 'grid'; // Show cards in session
                } else {
                    card.style.display = 'none'; // Hide cards not in session
                }
            }
        });
    }
    
    showAllCards() {
        const allThreatCards = document.querySelectorAll('.threat:not(#selectedThreat)');
        allThreatCards.forEach(card => {
            card.style.display = 'grid'; // Show all cards
        });
    }
    
    updateSessionThreatList() {
        const threatList = document.getElementById('sessionThreatList');
        
        if (!this.currentSession || this.currentSession.threats.length === 0) {
            threatList.innerHTML = '<p>No threats in this session yet.</p>';
            return;
        }
        
        threatList.innerHTML = this.currentSession.threats.map(threat => `
            <div class="session-threat-item">
                <span>${threat.name}</span>
                <button onclick="sessionManager.removeThreatFromSession('${threat.name}')">Remove</button>
            </div>
        `).join('');
    }
    
    populateAvailableThreats() {
        const availableSelect = document.getElementById('availableThreats');
        
        // Get all threat names from the page
        const threatNames = document.getElementsByClassName('threatName');
        const allThreatNames = Array.from(threatNames).map(elem => elem.innerHTML);
        
        // Filter out threats already in session
        const sessionThreatNames = this.currentSession ? this.currentSession.threats.map(t => t.name) : [];
        const availableThreats = allThreatNames.filter(name => !sessionThreatNames.includes(name));
        
        // Clear and populate select
        availableSelect.innerHTML = '<option value="">Select a threat to add...</option>';
        availableThreats.forEach(threatName => {
            const option = document.createElement('option');
            option.value = threatName;
            option.textContent = threatName;
            availableSelect.appendChild(option);
        });
    }
    
    addThreatToSession() {
        const availableSelect = document.getElementById('availableThreats');
        const selectedThreat = availableSelect.value;
        
        if (!selectedThreat || !this.currentSession) return;
        
        // Add threat to session
        this.currentSession.threats.push({
            name: selectedThreat,
            addedAt: new Date().toISOString()
        });
        
        this.currentSession.lastUpdated = new Date().toISOString();
        
        // Save updated session
        this.saveSession();
        this.updateURL(); // Update the shareable URL
        
        // Update UI
        this.updateSessionThreatList();
        this.populateAvailableThreats();
        this.updateMainThreatSelector();
        this.hideNonSessionCards(); // Update card visibility
    }
    
    removeThreatFromSession(threatName) {
        if (!this.currentSession) return;
        
        this.currentSession.threats = this.currentSession.threats.filter(t => t.name !== threatName);
        this.currentSession.lastUpdated = new Date().toISOString();
        
        // Save updated session
        this.saveSession();
        this.updateURL(); // Update the shareable URL
        
        // Update UI
        this.updateSessionThreatList();
        this.populateAvailableThreats();
        this.updateMainThreatSelector();
        this.hideNonSessionCards(); // Update card visibility
    }
    
    updateMainThreatSelector() {
        const selector = document.getElementById('selector');
        
        if (!this.currentSession) {
            // If no session, show all threats (existing behavior)
            return;
        }
        
        // Clear current options
        selector.innerHTML = '<option value="">Select a threat...</option>';
        
        // Add only session threats
        const sessionThreats = this.currentSession.threats.map(t => t.name).sort();
        sessionThreats.forEach(threatName => {
            const option = document.createElement('option');
            option.value = threatName;
            option.textContent = threatName;
            selector.appendChild(option);
        });
    }
    
    copySessionLink() {
        if (!this.currentSession) return;
        
        // Generate URL with encoded session data
        const sessionData = {
            id: this.currentSession.sessionId,
            name: this.currentSession.name,
            threats: this.currentSession.threats.map(t => t.name)
        };
        
        const encodedSession = btoa(JSON.stringify(sessionData));
        const sessionURL = `${window.location.origin}${window.location.pathname}?session=${encodedSession}`;
        
        navigator.clipboard.writeText(sessionURL).then(() => {
            alert('Session link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            prompt('Copy this session link:', sessionURL);
        });
    }
    
    endSession() {
        if (confirm('Are you sure you want to end this session?')) {
            this.currentSession = null;
            this.updateSessionUI();
            
            // Remove session from URL
            window.history.pushState({}, '', window.location.pathname);
            
            // Restore full threat list
            this.showAllCards();
            
            // Restore dropdown to show all threats
            const selector = document.getElementById('selector');
            location.reload(); // Simple way to restore original functionality
        }
    }
    
    checkForSessionInURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionParam = urlParams.get('session');
        
        if (sessionParam) {
            this.loadSessionFromURL(sessionParam);
        }
    }
    
    loadSessionFromURL(sessionParam) {
        try {
            // Try to decode as base64 (new URL-based format)
            const sessionData = JSON.parse(atob(sessionParam));
            
            this.currentSession = {
                sessionId: sessionData.id,
                name: sessionData.name,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                threats: sessionData.threats.map(name => ({
                    name: name,
                    addedAt: new Date().toISOString()
                })),
                settings: {
                    allowViewerRequests: false,
                    isPublic: true
                }
            };
            
            this.updateSessionUI();
            this.populateAvailableThreats();
            
            // Show only session threats in main selector
            setTimeout(() => this.updateMainThreatSelector(), 100);
            
        } catch (e) {
            // Fallback: try old localStorage format
            this.loadSession(sessionParam);
        }
    }
    
    loadSession(sessionId) {
        // Load from localStorage (fallback for old links)
        const sessionData = localStorage.getItem(`session_${sessionId}`);
        
        if (sessionData) {
            this.currentSession = JSON.parse(sessionData);
            this.updateSessionUI();
            this.populateAvailableThreats();
            
            // Show only session threats in main selector
            setTimeout(() => this.updateMainThreatSelector(), 100);
        } else {
            alert('Session not found!');
        }
    }
}

// Initialize session manager
let sessionManager;

// Use event delegation to handle clicks on threat names (including dynamically added ones)
$(document).on('click', '.threatName', function(e) {
    const $parent = $(this).parent();
    
    // Remove both classes first, then add the appropriate one
    if ($parent.hasClass('threatplayer')) {
        $parent.removeClass('threatplayer').addClass('threatgm');
    } else {
        $parent.removeClass('threatgm').addClass('threatplayer');
    }
});
  
$(function(){
    // Initialize session manager first
    sessionManager = new SessionManager();
    
    let selectElem = document.getElementById("selector");
    let selectedThreatDiv = document.getElementById("selectedThreat");

    let threatNames = document.getElementsByClassName( "threatName" );

    // console.log(threatNames);
    
    // Add default option
    var defaultOpt = document.createElement('option');
    defaultOpt.value = "";
    defaultOpt.innerHTML = "Select a threat...";
    selectElem.appendChild(defaultOpt);
    
    // Create array of threat names and sort alphabetically
    let threatNamesArray = [];
    for (let elem of threatNames) {
        threatNamesArray.push(elem.innerHTML);
    }
    threatNamesArray.sort();
    
    // Add sorted options to select element (only if no active session)
    if (!sessionManager.currentSession) {
        for (let threatName of threatNamesArray) {
            var opt = document.createElement('option');
            opt.value = threatName;
            opt.innerHTML = threatName;
            selectElem.appendChild(opt);
        }
    }
    
    // Handle selector change event
    $(selectElem).on('change', function() {
        const selectedName = this.value;
        
        if (selectedName === "") {
            // Hide the selected threat div by removing classes
            selectedThreatDiv.className = "";
            selectedThreatDiv.id = 'selectedThreat'; // Preserve the selectedThreat id
            return;
        }
        
        // Find the corresponding threat card
        const threatCards = document.querySelectorAll('.threat:not(#selectedThreat)');
        let matchingCard = null;
        
        for (let card of threatCards) {
            const nameDiv = card.querySelector('.threatName');
            if (nameDiv && nameDiv.innerHTML === selectedName) {
                matchingCard = card;
                break;
            }
        }
        
        if (matchingCard) {
            // Copy the content and styling from the matching card
            selectedThreatDiv.innerHTML = matchingCard.innerHTML;
            
            // Instead of copying the style attribute, set background properties individually
            // to avoid the problematic shorthand syntax
            const computedStyle = window.getComputedStyle(matchingCard);
            selectedThreatDiv.style.backgroundImage = computedStyle.backgroundImage;
            selectedThreatDiv.style.backgroundRepeat = computedStyle.backgroundRepeat;
            selectedThreatDiv.style.backgroundPosition = computedStyle.backgroundPosition;
            selectedThreatDiv.style.backgroundSize = computedStyle.backgroundSize;
            selectedThreatDiv.style.backgroundColor = computedStyle.backgroundColor;
            
            selectedThreatDiv.className = matchingCard.className;
            selectedThreatDiv.id = 'selectedThreat'; // Preserve the selectedThreat id
            
            // Ensure it starts as threatplayer (player view)
            selectedThreatDiv.classList.remove('threatgm');
            selectedThreatDiv.classList.add('threatplayer');
            
            // Remove any inline display style and let CSS handle visibility
            selectedThreatDiv.style.removeProperty('display');
            
            // Force a layout recalculation to ensure grid template areas are applied correctly
            selectedThreatDiv.offsetHeight; // Reading this property forces a reflow
            
            // Additionally, ensure the threat class is properly set
            if (!selectedThreatDiv.classList.contains('threat')) {
                selectedThreatDiv.classList.add('threat');
            }
        }
    });
    
    // Automatically select a random threat on page load (only if no session or session has threats)
    if (!sessionManager.currentSession && threatNamesArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * threatNamesArray.length);
        const randomThreat = threatNamesArray[randomIndex];
        selectElem.value = randomThreat;
        $(selectElem).trigger('change'); // Trigger the change event to update the display
    } else if (sessionManager.currentSession && sessionManager.currentSession.threats.length > 0) {
        // If in session mode, select first threat from session
        const sessionThreats = sessionManager.currentSession.threats.map(t => t.name);
        selectElem.value = sessionThreats[0];
        $(selectElem).trigger('change');
    }
});