$('.threatName').click(function(e) {
    $(this).parent().toggleClass('threatgm threatplayer');
  });
  
$(function(){
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
    
    // Add sorted options to select element
    for (let threatName of threatNamesArray) {
        var opt = document.createElement('option');
        opt.value = threatName;
        opt.innerHTML = threatName;
        selectElem.appendChild(opt);
    }
    
    // Handle selector change event
    $(selectElem).on('change', function() {
        const selectedName = this.value;
        
        if (selectedName === "") {
            // Hide the selected threat div if no selection
            selectedThreatDiv.style.display = 'none';
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
            selectedThreatDiv.style.cssText = matchingCard.style.cssText;
            selectedThreatDiv.className = matchingCard.className;
            selectedThreatDiv.id = 'selectedThreat'; // Preserve the selectedThreat id
            selectedThreatDiv.style.display = 'block';
        }
    });
    
    // Automatically select a random threat on page load
    if (threatNamesArray.length > 0) {
        const randomIndex = Math.floor(Math.random() * threatNamesArray.length);
        const randomThreat = threatNamesArray[randomIndex];
        selectElem.value = randomThreat;
        $(selectElem).trigger('change'); // Trigger the change event to update the display
    }
});