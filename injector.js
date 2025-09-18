// newButton = document.createElement('li');
// newButton.id = 'exportToMarkUp';
// newButton.innerHTML = '<span class="pictos">R</span>'; // g or R or /
// newButton.onclick = function() {exportCharactersToMarkUp();};

// document.querySelector('li#helpsite').insertAdjacentElement('afterend', newButton);

// Wrap everything in a try-catch and add null checks
try {
    console.log('Looking for dice button...');
    var diceButton = document.querySelector('div#dice-button');
    console.log('Dice button found:', diceButton);
    
    if (diceButton) {
        console.log('Creating export button...');
        var newNewButton = diceButton.cloneNode(true);
        newNewButton.id = 'exportToMarkUp';
        var spans = newNewButton.getElementsByTagName('span');
        if (spans.length > 0 && spans[0].parentElement) {
            spans[0].parentElement.innerHTML = '<span class="pictos">R</span>';
        }
        newNewButton.onclick = function() {exportCharactersToMarkUp();};
        newNewButton.title = 'Click to export character to markup format';
        diceButton.insertAdjacentElement('afterend', newNewButton);
        console.log('Export button created and inserted');
    } else {
        console.log('Dice button not found');
    }

    var threatCardElement = document.createElement("pre");
    threatCardElement.className = "muThreatCard";
    threatCardElement.style.cssText = "-moz-user-select: all; -webkit-user-select: all; -ms-user-select: all;";
} catch(e) {
    console.error('Error in initial setup:', e);
}

function exportCharactersToMarkUp() {
    try {
        console.log('Starting exportCharactersToMarkUp...');
        
        var Character = {
        CharacterName: '',
        Cosm: '',
        Attributes: {},
        SkillList: {},
        DerivedValues: {
            Move: '',
            Tough: '',
            Armor: '',
            Shock: '',
            Wounds: ''
        },
        Defenses: {
            Dodge: '',
            Melee: '',
            Unarmed: '',
            Tough: '',
            Armor: '',
            Intimidate: '',
            Maneuver: '',
            Taunt: '',
            Trick: '',
            Faith: '',
            Willpower: '',
            WillpowerMind: ''
        },
        Possibilities: '',
        Perks: {},
        Equipment: {},
        Powers: {},
    
        scrapeSheet: function(sheet) {
            this.CharacterName = sheet.getElementsByName("attr_Name")[0].value;
            this.Cosm = sheet.getElementsByName("attr_Home_Cosm")[0].selectedOptions[0].text;
            this.extractAttributes(sheet);
            this.extractSkills(sheet);   
            this.DerivedValues.Move = sheet.getElementsByName("attr_Movement")[0].value;
            this.DerivedValues.Tough = sheet.getElementsByName("attr_toughness")[0].value;
            this.DerivedValues.Armor = sheet.getElementsByName("attr_Armor")[0].value;
            this.DerivedValues.Shock = sheet.getElementsByName("attr_shock_max")[0].value;
            this.DerivedValues.Wounds = sheet.getElementsByName("attr_wound_max")[0].value;
            this.Possibilities = sheet.getElementsByName("attr_possibilities")[0].textContent;
            this.Defenses.Dodge = sheet.getElementsByName("attr_defense_Dodge")[0].value;
            this.Defenses.Melee = sheet.getElementsByName("attr_defense_MeleeWeapons")[0].value;
            this.Defenses.Unarmed = sheet.getElementsByName("attr_defense_UnarmedCombat")[0].value;
            this.Defenses.Tough = this.DerivedValues.Tough;
            this.Defenses.Armor = this.DerivedValues.Armor;
            this.Defenses.Intimidate = sheet.getElementsByName("attr_defense_Intimidate")[0].value;
            this.Defenses.Maneuver = sheet.getElementsByName("attr_defense_Maneuver")[0].value;
            this.Defenses.Taunt = sheet.getElementsByName("attr_defense_Taunt")[0].value;
            this.Defenses.Trick = sheet.getElementsByName("attr_defense_Trick")[0].value;
            this.Defenses.Faith = sheet.getElementsByName("attr_defense_Faith")[0].value;
            this.Defenses.Willpower = sheet.getElementsByName("attr_defense_Willpower")[0].value;
            this.Defenses.WillpowerMind = sheet.getElementsByName("attr_defense_WillpowerMind")[0].value;
            this.extractPerks(sheet);
            this.extractWeaponsAndPowers(sheet);
            this.extractArmor(sheet);
            this.extractEquipment(sheet);
        },
    
        extractPerks: function(sheet) {
            var perkList = {};
            this.Perks = {};
    
            sheet.querySelectorAll('input[name="attr_PerkName"]').forEach(function (elem) {
                if( elem.value != "" ) perkList[elem.value] = elem.nextElementSibling.value;
            });
    
            this.Perks = perkList;
        },
    
        extractWeaponsAndPowers: function(sheet) {
            let weaponList = {};
            let powerList = {};
    
            sheet.querySelectorAll('input.sheet-weapon-powers-toggle').forEach(function (elem) {
                if( elem.parentElement.childNodes[3].value != "" ) {
                    if( elem.value == "0" ) weaponList[elem.parentElement.childNodes[3].value] = "Damage " + elem.parentElement.childNodes[21].querySelector('input[name="attr_Attack_Damage_Display"]').value;
                    else powerList[elem.parentElement.childNodes[3].value] = elem.parentElement.childNodes[11].selectedOptions[0].textContent;    
                }
            });
    
            this.Equipment = Object.assign(weaponList);
            this.Powers = Object.assign(powerList);
        },
        
        extractArmor: function(sheet) {
            var ArmorList = {};
    
            // sheet.querySelectorAll('input[name="attr_armor_worn"][value="1"]').forEach(function (elem) {
            sheet.querySelectorAll('input[name="attr_Armor_Name"]').forEach(function (elem) {
                if(elem.value != "") {
                    ArmorList[elem.value] = "Armor +" + elem.parentElement.childNodes[7].value +
                        ( elem.parentElement.childNodes[9].value != "" ? ", Max Dex " + elem.parentElement.childNodes[9].value : "" ) +
                        ( elem.parentElement.childNodes[11].value != "" ? ", Fatigue (" + elem.parentElement.childNodes[11].value + ")" : "" ) +
                        ( elem.parentElement.childNodes[13].value != "" ? ", " + elem.parentElement.childNodes[13].value : "" );
                }
            });
    
            this.Equipment = Object.assign(this.Equipment, ArmorList);
        },
        
        extractEquipment: function(sheet) {
            var equipList = {};
    
            sheet.querySelectorAll('input[name="attr_EquipmentName"]').forEach(function (elem) {
                if( elem.value != "" ) equipList[elem.value] = elem.nextElementSibling.value;
            });
    
            this.Equipment = Object.assign(this.Equipment, equipList);
        },
    
        extractSkills: function(sheet) {
            var SkillButtons = sheet.querySelector('div.sheet-skills').querySelectorAll('button.sheet-ability-roll');
    
            var buildSkills = {};
    
            SkillButtons.forEach(function(item){
                if( item.name != 'act_skills_toggle' && item.nextElementSibling.value != 0 ) {
                    var SkillName = item.textContent.match(/^\n?\s*(.*)/)[1];
                    var SkillValue = item.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.value;
                    
                    buildSkills[SkillName] = SkillValue;
                }
            });
    
            this.SkillList = buildSkills;
        },
    
        extractAttributes: function(sheet) {
            this.Attributes["Charisma"] = sheet.getElementsByName("attr_CHA")[0].value;
            this.Attributes.Dexterity = sheet.getElementsByName("attr_DEX")[0].value;
            this.Attributes.Mind = sheet.getElementsByName("attr_MIN")[0].value;
            this.Attributes.Spirit = sheet.getElementsByName("attr_SPI")[0].value;
            this.Attributes.Strength = sheet.getElementsByName("attr_STR")[0].value;    
        },
    
        padString: function(textString, pad=2, padText=' ') {
            while( textString.length < pad )
                textString = padText + textString;
    
            return textString;
        },
    
        get AttributeText() {
            var AttributeText = "**Attributes:** ";

            var keys = Object.keys(this.Attributes);

            for (let index = 0; index < keys.length; index++) {
                AttributeText += keys[index] + " " + this.Attributes[keys[index]] + ( index + 1 == keys.length ? "" : ", " );
            }
    
            return AttributeText;
        },
    
        get SkillText() {
            var SkillsText = "**Skills:** ";
            var sl = this.SkillList;
    
            Object.keys(this.SkillList).sort().forEach(function(item){
                SkillsText += item + " " + sl[item] + ", ";
            });
    
            return SkillsText;
        },
    
        get DerivedValueText() {
            return "**Move:** " + this.DerivedValues.Move +
                "; **Tough:** " + this.DerivedValues.Tough +
                ( this.DerivedValues.Armor > 0 ? " (" + this.DerivedValues.Armor + ")" : "" ) +
                "; **Shock:** " + ( this.DerivedValues.Shock == 0 ? "-" : this.DerivedValues.Shock ) +
                "; **Wounds:** " + ( this.DerivedValues.Wounds == 0 ? "-" : this.DerivedValues.Wounds );
        },

        get EquipmentListText() {
            var equipmentString = "";
    
            for (const equip in this.Equipment) {
                if (Object.hasOwnProperty.call(this.Equipment, equip)) {
                    const description = this.Equipment[equip];
                    
                    equipmentString += equip + ( description != "" ? " (" + description + ")" : "" ) + ", ";
                }
            };

            return ( equipmentString.length > 0 ? "> **Equipment**: " + equipmentString.substring(0, equipmentString.length - 2) + "\n" : "" );
        },

        get PowerListText() {
            var powersString = "";
    
            for (const power in this.Powers) {
                if (Object.hasOwnProperty.call(this.Powers, power)) {
                    const skill = this.Powers[power];
                    
                    powersString += power + ( skill != "" ? " (" + skill + ")" : "" ) + ", ";
                }
            };

            return ( powersString.length > 0 ? "> **Powers**: " + powersString.substring(0, powersString.length - 2) + "\n" : "" );
        },

        get PerkListText() {
            var perkList = Object.keys(this.Perks);
    
            return ( perkList.length > 0 ? "> **Perks**: " + perkList.join(", ") + "\n" : "" );
        },
    
        get MarkUp() {
            var markUp = "> **__ " + this.CharacterName + " __**\n" +
                "> \n" +
                "> **Cosm:** " + this.Cosm + "\n" +
                "> " + this.AttributeText + "\n" +
                "> " + this.SkillText + "\n" +
                "> " + this.DerivedValueText + "\n" +
                "> **Possibilities:** " + ( this.Possibilities > 0 ? this.Possibilities : "-" ) + "\n" +
                this.EquipmentListText +
                this.PerkListText +
                this.PowerListText;
    
            return markUp;    
        },
    
        get ThreatCard() {
            var tC = 
                "> **__ " + this.CharacterName + " __**\n" +
                "> ```\n" +
                "> Intimidation " + this.padString(this.Defenses.Intimidate) + "   Melee       " + this.padString(this.Defenses.Melee) + "\n" +
                "> Maneuver     " + this.padString(this.Defenses.Maneuver) +   "   Dodge       " + this.padString(this.Defenses.Dodge) + "\n" +
                "> Taunt        " + this.padString(this.Defenses.Taunt) +      "   Unarmed     " + this.padString(this.Defenses.Unarmed) + "\n" +
                "> Trick        " + this.padString(this.Defenses.Trick) +      "   Toughness   " + this.padString(this.Defenses.Tough) + ( this.DerivedValues.Armor > 0 ? " (" + this.DerivedValues.Armor + ")" : "" ) + "\n" +
                "> Willpower    " + this.padString(this.Defenses.Willpower) +  "   Will (Mind) " + this.padString(this.Defenses.WillpowerMind) + "\n" +
                "> ```\n" +
                "> **Shock:** " + ( this.DerivedValues.Shock == 0 ? "-" : this.DerivedValues.Shock ) + ",   **Wounds:** " + ( this.DerivedValues.Wounds == 0 ? "-" : this.DerivedValues.Wounds ) +
                (( this.Possibilities == 0 || this.Possibilities == undefined ? "" : ",   **Possibilities:** " + this.Possibilities ) ) + "\n" +
                "> \n" +
                this.EquipmentListText +
                this.PerkListText +
                this.PowerListText;
    
            return tC;
        }
    };

    var iFrames = document.getElementsByTagName("iframe");
        console.log('Found', iFrames.length, 'iframes');

        for (let index = 0; index < iFrames.length; index++) {
            const frame = iFrames[index];
        
            try {
                if (frame.contentDocument != null) {
                    const sheet = frame.contentDocument;
        
                    if (frame.attributes != null && frame.attributes.title != null && frame.attributes.title.textContent.startsWith("Character sheet")) {
                        console.log('Processing character sheet in iframe', index);
                        Character.scrapeSheet(sheet);

                        if (sheet.querySelectorAll('pre.muThreatCard').length == 0) {
                            var threatCardElement = document.createElement("pre");
                            threatCardElement.className = "muThreatCard";
                            threatCardElement.style.cssText = "-moz-user-select: all; -webkit-user-select: all; -ms-user-select: all;";
                            threatCardElement.innerHTML = Character.ThreatCard;
        
                            var clBr = document.createElement("br");
                            clBr.setAttribute('clear', 'all');
        
                            var bioElement = sheet.querySelector('div#tab-content');
                            if (bioElement) {
                                bioElement = bioElement.querySelector('div.content.note-editor.summernote.bio');
                                if (bioElement) {
                                    bioElement.appendChild(clBr);
                                    bioElement.appendChild(threatCardElement);

                                    var muSheet = document.createElement("pre");
                                    muSheet.className = "muSheet";
                                    muSheet.style.cssText = "-moz-user-select: all; -webkit-user-select: all; -ms-user-select: all;";
                                    muSheet.innerHTML = Character.MarkUp;

                                    bioElement.appendChild(muSheet);
                                    console.log('Added threat card and markup to bio');
                                } else {
                                    console.error('Could not find bio element');
                                }
                            } else {
                                console.error('Could not find tab-content element');
                            }
                        } else {
                            var threatCardElement = sheet.querySelector('pre.muThreatCard');
                            if (threatCardElement) {
                                threatCardElement.innerHTML = Character.ThreatCard;
                            }

                            var muSheet = sheet.querySelector('pre.muSheet');
                            if (muSheet) {
                                muSheet.innerHTML = Character.MarkUp;
                            }
                            console.log('Updated existing threat card and markup');
                        }
                    }
                } else {
                    console.log('iframe', index, 'contentDocument is null - probably cross-origin');
                }
            } catch (frameError) {
                console.error('Error processing iframe', index, ':', frameError);
            }
        }
    } catch(error) {
        console.error('Error in exportCharactersToMarkUp:', error);
    }
}

// Button creation only - no automatic processing since character sheets aren't available on load

// Create button immediately, regardless of auto-run success
setTimeout(function() {
    console.log('Creating button after delay...');
    try {
        // Check if button already exists
        if (document.getElementById('exportToMarkUp')) {
            console.log('Button already exists');
            return;
        }
        
        var diceButton = document.querySelector('div#dice-button');
        console.log('Dice button found after delay:', diceButton);
        
        if (diceButton) {
            console.log('Creating export button...');
            var newNewButton = diceButton.cloneNode(true);
            newNewButton.id = 'exportToMarkUp';
            var spans = newNewButton.getElementsByTagName('span');
            if (spans.length > 0 && spans[0].parentElement) {
                spans[0].parentElement.innerHTML = '<span class="pictos">R</span>';
            }
            newNewButton.onclick = function() {exportCharactersToMarkUp();};
            newNewButton.title = 'Click to export character to markup format';
            diceButton.insertAdjacentElement('afterend', newNewButton);
            console.log('Export button created and inserted');
        } else {
            console.log('Dice button not found, no button created');
        }
    } catch(e) {
        console.error('Error creating button:', e);
    }
}, 2000);