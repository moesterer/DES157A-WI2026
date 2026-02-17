( function(){
  'use strict';
  console.log('reading js');

  const myForm = document.querySelector('form');

  const madlib = document.querySelector('section[aria-labelledby="storyTitle"]');

  const formData = document.querySelectorAll('input[type=text]');

  myForm.addEventListener('submit', function(event){
    event.preventDefault();
    processFormData(formData);
  });

  function processFormData(formData){ 
    
    const words = [];
    const emptyfields = [];
    let counter = 0;

    for (const eachWord of formData) {
      if (eachWord.value) {
        words.push(eachWord.value);
      } else {
        emptyfields.push(counter);
      }

      counter++; 
    }

    if (emptyfields.length > 0) {
      showErrors(formData, emptyfields);
    } else {
      makeMadlib(words); 
    } 
  }

  function showErrors(formData, emptyfields){
    const errorId = formData[emptyfields[0]].id;
    const errorText = `Please fill out this field ${errorId}`;

    madlib.innerHTML = `
      <h2 id="storyTitle">Your Dark Tale</h2>
      <p><strong>${errorText}</strong></p>
    `;
    document.querySelector(`#${errorId}`).focus();
  }

  function makeMadlib(words){

    const myText = `
      <h2 id="storyTitle">Your Dark Tale</h2>

      <p>
        The winding pathways lined with scattered ${words[2]} ended in one place: a clearing drowned in ${words[0]} mist.
        ${words[1]} trees scratched at the sky like warnings, and the wind carried the scent of something hungry.
      </p>

      <p>
        A woman in a dark cloak ${words[5]} to the center, gripping a ${words[3]} crowned with a ${words[4]} jewel.
        Her ears twitched. She glanced into the woods and whispered ${words[6]}, “They’re coming.”
      </p>

      <p>
        From the darkness, soldiers emerged - empty-eyed, silent. A man in golden armor stepped forward.
        “Faven,” he drawled, voice smooth as poison.
      </p>

      <p>
        Faven’s grip tightened. “Marvin,” she said, and the name tasted like ash.
        “You and your army won’t last forever.”
      </p>

      <p>
        He laughed, and the sound was a ${words[8]} that didn’t belong in the night.
        “When I kill you,” he murmured, “the small spark of rebellion dies.”
      </p>

      <p>
        Faven’s eyes burned. “Not tonight.”
      </p>

      <p>
        She lunged, magic flaring - she began to ${words[7]}, tearing the clearing apart.
        Fire climbed into the air. Shadows stumbled back. A shot rang out and she clutched her heart.
      </p>

      <p>
        For the first time since the battle began, Faven faltered. She ${words[9]} to the ground, clutching her ${words[3]}
        like it could keep her alive.
      </p>

      <p>
        Marvin leaned close. “Where has your tongue gone now?” he hissed.
      </p>

      <p>
        Faven said nothing - only glared through the mist to the sky still burning, searing the image of a dying world to her mind.
      </p>
    `;

    madlib.innerHTML = myText;

    
    for (const eachField of formData) {
      eachField.value = '';
    } 

  }

} )();









