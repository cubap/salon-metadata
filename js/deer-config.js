import { default as UTILS } from 'https://centerfordigitalhumanities.github.io/deer/js/deer-utils.js'
import { default as tagsInput } from './tags-input.js'

export default {
    ID: "deer-id",                  // attribute, URI for resource to render
    TYPE: "deer-type",              // attribute, JSON-LD @type
    TEMPLATE: "deer-template",      // attribute, enum for custom template
    KEY: "deer-key",                // attribute, key to use for annotation
    LABEL: "title",                 // attribute, alternate label for properties
    CONTEXT: "deer-context",        // attribute, JSON-LD @context, scoped
    LIST: "deer-list",              // attribute, property with resource array
    COLLECTION: "deer-collection",  // attribute, name of aggregating collection
    LISTENING: "deer-listening",    // attribute, name of container to watch for clicks
    LINK: "deer-link",              // attribute, location of href#[deer-id] for <a>s
    VIEW: "deer-view, .deer-view",  // selector, identifies render containers
    FORM: "form[deer-type]",        // selector, identifies data entry containers
    SOURCE: "deer-source",          // attribute, URI for asserting annotation
    EVIDENCE: "nv-evidence",        // attribute, URI for supporting evidence
    
    INPUTS: ["input","textarea","dataset","select"], // array of selectors, identifies inputs with .value
    ENTITYNAME: "[deer-key='name']",// selector, value to grab for form entity label

    URLS: {
        BASE_ID: "http://store.rerum.io/v1",
        CREATE: "http://tiny.rerum.io/app/create",
        UPDATE: "http://tiny.rerum.io/app/update",
        QUERY: "http://tiny.rerum.io/app/query",
        SINCE: "http://store.rerum.io/v1/since"
    },

    EVENTS: {
        CREATED: "deer-created",
        UPDATED: "deer-updated",
        LOADED: "deer-loaded",
        CLICKED: "deer-clicked"
    },

    SUPPRESS: ["__rerum","@context"],   // properties to ignore
    ATTRIBUTION: "testMachine",         // replace with user to attribute assertions

    /**
     * Add any custom templates here through import or copy paste.
     * Templates added here will overwrite the defaults in deer-render.js.
     * 
     * Each property must be lower-cased and return a template literal
     * or an HTML String.
     */
    TEMPLATES: {
        items: function(obj, options={}) {
            function getIcon(type) {
                let icon = () => {
                    if (type) {
                        if(typeof type==="object") {
                            type = UTILS.getValue(type)
                        }
                        if (/(list|collection)/gi.test(type)) return "list"
                        if (/(person|user)/gi.test(type)) return "user"
                        if (/(organization)/gi.test(type)) return "sitemap"
                        if (/(application|software)/gi.test(type)) return "laptop-code"
                        if (/(book|manuscript)/gi.test(type)) return "book"
                        if (/(thing)/gi.test(type)) return "box"
                        if (/(image)/gi.test(type)) return "image"
                        if (/(creative)/gi.test(type)) return "palette"
                        if (/(email)/gi.test(type)) return "envelope"
                        if (/(pdf)/gi.test(type)) return "file-pdf"
                        if (/(communicate)/gi.test(type)) return "comment-dots"
                        if (/(video)/gi.test(type)) return "video"
                    }
                    return "angle-right"
                }
                return `<i class="fas fa-${icon()}"></i>`
            }
            let tmpl = `<h2>${UTILS.getLabel(obj)}</h2>`
            if(options.list){
                obj[options.list].forEach((val,index)=>{
                    let name = UTILS.getLabel(val,(val.type || val["rdf:resource"] || val['@type'] || index))
                    tmpl+= (val["@id"] && options.link) 
                    ? `<div deer-id="${val["@id"]}"><a href="${options.link}${val["@id"]}">${getIcon(val.encodingFormat || val["@type"])} ${name}</a></div>` 
                    : `<div deer-id="${val["@id"]}">${getIcon(val.encodingFormat || val["@type"])} ${name}</div>`
                })
            }
            return tmpl
        },
        entity: function(obj, options = {}) {
            function firstLabel(obj){
                let label = UTILS.getLabel(obj)
                return (Array.isArray(label)) ? label[0] : label
            }
            let tmpl = `<h2>${firstLabel(obj)}</h2>`
            let list = ``
            
            for (let key in obj) {
                if(["__rerum","@context"].indexOf(key)>-1) {continue}
                let label = UTILS.getLabel(obj[key],key)
                let value = UTILS.getValue(obj[key])
                try {
                    if ((value.image || value.trim()).length > 0) {
                        list += (label === "depiction") ? `<img title="${label}" src="${value.image || value}" deer-source="${obj[key].source.citationSource || obj[key].source }">` : `<dt deer-source="${obj[key].source.citationSource || obj[key].source }">${label}</dt><dd>${value.image || value}</dd>`
                    }
                } catch (err) {
                    // Some object maybe or untrimmable somesuch
                    // is it object/array?
                    list+=`<dt>${label}</dt>`
                    if(Array.isArray(value)){
                        let arrVal = ``
                        value.forEach((val,index)=>{
                            let name = UTILS.getLabel(val,(val.type || val['@type'] || label+index))
                            if(arrVal.indexOf(val["@id"])===-1 && arrVal.indexOf(name)===-1) {
                                arrVal+= (val["@id"]) ? `<dd><a href="#${val["@id"]}">${name}</a></dd>` : `<dd>${name}</dd>`
                            }
                        })
                        if(arrVal.length>0) list += arrVal
                    } else {
                        // a single, probably
                        let v = UTILS.getValue(value)
                        if(typeof v==="object") { v = UTILS.getLabel(v) }
                        if(v === "[ unlabeled ]") { v = v['@id'] || v.id || "[ complex value unknown ]"}
                        list+=(value['@id'])?`<dd><a href="${options.link||""}#${value['@id']}">${v}</a></dd>`:`<dd>${v}</dd>`
                    }
                }
            }
            tmpl += (list.includes("<dd>")) ? `<dl>${list}</dl>` : ``
            return tmpl
        }
        
    },

    version: "alpha 0.7"
}