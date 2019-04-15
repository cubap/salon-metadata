/**
 * @module DEER Data Encoding and Exhibition for RERUM (DEER)
 * @author Patrick Cuba <cubap@slu.edu>
 * @author Bryan Haberberger <bryan.j.haberberger@slu.edu>
 * @version 0.7

 * This code should serve as a basis for developers wishing to
 * use TinyThings as a RERUM proxy for an application for data entry,
 * especially within the Eventities model.
 * @see tiny.rerum.io
 */

// Identify an alternate config location or only overwrite some items below.
import { default as DEER } from './deer-config.js'

// Render is probably needed by all items, but can be removed.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { initializeDeerViews } from 'https://centerfordigitalhumanities.github.io/deer/js/deer-render.js'

// Record is only needed for saving or updating items.
// CDN at https://centerfordigitalhumanities.github.io/deer/releases/
import { initializeDeerForms } from 'https://centerfordigitalhumanities.github.io/deer/js/deer-record.js'

// fire up the element detection as needed
initializeDeerViews(DEER) 
initializeDeerForms(DEER)

/** Non-DEER code */
const addCharacter = new MutationObserver(filterPersons)
function filterPersons(mutationsList) {
    for (var mutation of mutationsList) {
        let person = mutation.target
        if( isInThisBook(person.getAttribute(DEER.ID),document.querySelector("["+DEER.KEY+"='isPartOf']").value) ) {
            // person is mentioned in the book already
            person.onclick = (event)=> addPersonToIncident(person,document.querySelector("["+DEER.KEY+"='subjectOf']"))
        } else {
            person.addClass("is-hidden") // hide from clicks and view 
        }
	}
}
addCharacter.observe(characterList, {
    childList:true
})

function isInThisBook(personId, bookId) {
    try{
        return texts.querySelector("["+DEER.ID+"='"+bookId+"']").getAttribute("schema-mentions").indexOf(personId) > -1
    } catch(err){ return false }
}
function addPersonToIncident(person,incident) {
    let id = person.getAttribute(DEER.ID)
    let title = person.textContent
    if(incident.value==="") {
        incident.title= title
        incident.value= id 
    } else if (incident.value.indexOf(id)===-1) {
        incident.title += ", "+title
        incident.value += ","+id 
    }
}